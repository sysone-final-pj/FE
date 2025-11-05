import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authToken } from '@/shared/lib/authToken';
import type { WebSocketStatus, WebSocketError } from '@/shared/types/websocket';

/**
 * STOMP 웹소켓 클라이언트 싱글톤
 * - 자동 재연결
 * - JWT 인증
 * - 연결 상태 관리
 */
class StompClientManager {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();
  private errorListeners: Set<(error: WebSocketError) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * STOMP 클라이언트 초기화 및 연결
   */
  connect(): void {
    if (this.client?.active) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    this.notifyStatus('connecting');

    this.client = new Client({
      // SockJS를 사용한 WebSocket 연결
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,

      // 연결 헤더 (JWT 인증)
      connectHeaders: this.getConnectHeaders(),

      // 디버그 로그 (개발 환경에서만)
      debug: (str: string) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket Debug]', str);
        }
      },

      // 재연결 설정
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // 연결 성공 콜백
      onConnect: () => {
        console.log('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
        this.notifyStatus('connected');
        this.resubscribeAll();
      },

      // 연결 종료 콜백
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.notifyStatus('disconnected');
      },

      // STOMP 에러 콜백
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
        this.notifyError({
          type: 'connection',
          message: frame.headers['message'] || 'STOMP connection error',
          timestamp: Date.now(),
        });
        this.notifyStatus('error');
      },

      // WebSocket 에러 콜백
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
        this.notifyError({
          type: 'connection',
          message: 'WebSocket connection error',
          timestamp: Date.now(),
        });
        this.notifyStatus('error');
      },

      // 연결 종료 시 콜백
      onWebSocketClose: () => {
        console.log('[WebSocket] Connection closed');
        this.handleReconnect();
      },
    });

    this.client.activate();
  }

  /**
   * WebSocket URL 생성
   */
  private getWebSocketUrl(): string {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8081';
    return `${baseUrl}/ws`;
  }

  /**
   * 연결 헤더 생성 (JWT 토큰 포함)
   */
  private getConnectHeaders(): Record<string, string> {
    const token = authToken.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * 재연결 처리
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.notifyError({
        type: 'connection',
        message: 'Failed to reconnect after multiple attempts',
        timestamp: Date.now(),
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * 토픽 구독
   */
  subscribe(destination: string, callback: (message: IMessage) => void): string {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Not connected. Subscription will be deferred:', destination);
      this.connect();
    }

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const doSubscribe = () => {
      if (!this.client?.connected) {
        console.error('[WebSocket] Cannot subscribe: not connected');
        return;
      }

      try {
        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions.set(subscriptionId, subscription);
        console.log('[WebSocket] Subscribed to:', destination);
      } catch (error) {
        console.error('[WebSocket] Subscription error:', error);
        this.notifyError({
          type: 'subscription',
          message: `Failed to subscribe to ${destination}`,
          timestamp: Date.now(),
        });
      }
    };

    if (this.client?.connected) {
      doSubscribe();
    } else {
      // 연결되면 자동으로 구독하도록 대기
      const connectListener = () => {
        doSubscribe();
        this.removeStatusListener(connectListener);
      };
      this.addStatusListener(connectListener);
    }

    return subscriptionId;
  }

  /**
   * 구독 해제
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log('[WebSocket] Unsubscribed:', subscriptionId);
    }
  }

  /**
   * 메시지 발행
   */
  publish(destination: string, body: unknown): void {
    if (!this.client?.connected) {
      console.error('[WebSocket] Cannot publish: not connected');
      this.notifyError({
        type: 'message',
        message: 'Cannot send message: not connected',
        timestamp: Date.now(),
      });
      return;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
      console.log('[WebSocket] Published to:', destination);
    } catch (error) {
      console.error('[WebSocket] Publish error:', error);
      this.notifyError({
        type: 'message',
        message: `Failed to publish to ${destination}`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 모든 구독 재등록 (재연결 시)
   */
  private resubscribeAll(): void {
    console.log('[WebSocket] Resubscribing to all topics...');
    // 구독은 useWebSocket 훅에서 자동으로 다시 등록됨
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.notifyStatus('disconnected');
      console.log('[WebSocket] Disconnected manually');
    }
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * 상태 변경 리스너 등록
   */
  addStatusListener(listener: (status: WebSocketStatus) => void): void {
    this.statusListeners.add(listener);
  }

  /**
   * 상태 변경 리스너 제거
   */
  removeStatusListener(listener: (status: WebSocketStatus) => void): void {
    this.statusListeners.delete(listener);
  }

  /**
   * 에러 리스너 등록
   */
  addErrorListener(listener: (error: WebSocketError) => void): void {
    this.errorListeners.add(listener);
  }

  /**
   * 에러 리스너 제거
   */
  removeErrorListener(listener: (error: WebSocketError) => void): void {
    this.errorListeners.delete(listener);
  }

  /**
   * 상태 변경 알림
   */
  private notifyStatus(status: WebSocketStatus): void {
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * 에러 알림
   */
  private notifyError(error: WebSocketError): void {
    this.errorListeners.forEach((listener) => listener(error));
  }
}

// 싱글톤 인스턴스 생성 및 export
export const stompClient = new StompClientManager();
