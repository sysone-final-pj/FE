/**
 작성자: 김슬기
 */
import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authToken } from '@/shared/lib/authToken';
import type { WebSocketStatus, WebSocketError } from '@/shared/types/websocket';
import { useWebSocketStore } from '@/shared/stores/useWebSocketStore';

/**
 * STOMP 웹소켓 클라이언트 싱글톤
 * - 자동 재연결
 * - JWT 인증
 * - Zustand Store 연동
 * - 401 에러 시 자동 로그아웃
 */
class StompClientManager {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set();
  private errorListeners: Set<(error: WebSocketError) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  // pending 구독 추적 (연결 전 구독 관리)
  private pendingSubscriptions = new Map<string, { destination: string; callback: (message: IMessage) => void }>();
  private pendingListeners = new Map<string, (status: WebSocketStatus) => void>();
  private subscriptionCounter = 0; // ID 충돌 방지용 카운터

  /**
   * STOMP 클라이언트 초기화 및 연결
   */
  connect(): void {
    if (this.client?.active) {
      // console.log('[WebSocket] Already connected');
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    this.notifyStatus('connecting');
    useWebSocketStore.getState().setStatus('connecting');

    this.client = new Client({
      // SockJS를 사용한 WebSocket 연결
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,

      // 연결 헤더 (JWT 인증)
      connectHeaders: this.getConnectHeaders(),

      // 디버그 로그 (개발 환경에서만)
      debug: (_str: string) => {
        if (import.meta.env.DEV) {
          // console.log('[WebSocket Debug]', _str);
        }
      },

      // 재연결 설정
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // 연결 성공 콜백
      onConnect: () => {
        // console.log('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
        this.notifyStatus('connected');
        useWebSocketStore.getState().setStatus('connected');
        useWebSocketStore.getState().resetRetry(); // 재연결 시도 횟수 리셋
        useWebSocketStore.getState().clearError();

        // pending된 구독 처리 (재연결 시)
        this.processPendingSubscriptions();

        this.resubscribeAll();
      },

      // 연결 종료 콜백
      onDisconnect: () => {
        // console.log('[WebSocket] Disconnected');
        this.notifyStatus('disconnected');
        useWebSocketStore.getState().setStatus('disconnected');
      },

      // STOMP 에러 콜백
      onStompError: (frame) => {
        // console.error('[WebSocket] STOMP error:', frame);
        const errorMessage = frame.headers['message'] || 'STOMP connection error';

        const error: WebSocketError = {
          type: 'connection',
          message: errorMessage,
          timestamp: Date.now(),
        };

        this.notifyError(error);
        this.notifyStatus('error');
        useWebSocketStore.getState().setError(error);

        // 401 Unauthorized 에러 처리
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          // console.error('[WebSocket] Authentication failed - redirecting to login');
          authToken.remove();
          window.location.href = '/login';
        }
      },

      // WebSocket 에러 콜백
      onWebSocketError: (_event) => {
        // console.error('[WebSocket] WebSocket error:', _event);
        const error: WebSocketError = {
          type: 'connection',
          message: 'WebSocket connection error',
          timestamp: Date.now(),
        };
        this.notifyError(error);
        this.notifyStatus('error');
        useWebSocketStore.getState().setError(error);
      },

      // 연결 종료 시 콜백
      onWebSocketClose: () => {
        // console.log('[WebSocket] Connection closed');
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
    return `${baseUrl}`;
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
   * - 재연결 시도 횟수를 Store에 기록
   * - 최대 시도 횟수 초과 시 완전 실패 상태로 전환 (REST fallback 트리거)
   */
  private handleReconnect(): void {
    // Store에 재연결 시도 횟수 증가 기록
    useWebSocketStore.getState().incrementRetry();

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // console.error('[WebSocket] Max reconnect attempts reached - REST fallback 활성화');
      const error: WebSocketError = {
        type: 'connection',
        message: 'Failed to reconnect after multiple attempts',
        timestamp: Date.now(),
      };
      this.notifyError(error);
      useWebSocketStore.getState().setError(error);
      useWebSocketStore.getState().setConnectionFailed(true);
      return;
    }

    this.reconnectAttempts++;
    // console.log(`[WebSocket] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    useWebSocketStore.getState().setStatus('connecting');

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * 토픽 구독
   */
  subscribe(destination: string, callback: (message: IMessage) => void): string {
    if (!this.client?.connected) {
      // console.warn('[WebSocket] Not connected. Subscription will be deferred:', destination);
      this.connect();
    }

    // subscriptionId 생성 (충돌 방지: counter 사용)
    const subscriptionId = `sub-${Date.now()}-${++this.subscriptionCounter}`;

    const doSubscribe = () => {
      if (!this.client?.connected) {
        // console.error('[WebSocket] Cannot subscribe: not connected');
        return;
      }

      try {
        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions.set(subscriptionId, subscription);
        // console.log('[WebSocket] Subscribed to:', destination);
      } catch (error) {
        // console.error('[WebSocket] Subscription error:', error);
        this.notifyError({
          type: 'subscription',
          message: `Failed to subscribe to ${destination}`,
          timestamp: Date.now(),
        });
      }
    };

    if (this.client?.connected) {
      // 이미 연결됨 → 즉시 구독
      doSubscribe();
    } else {
      // 연결 대기 → pending에 추가
      const connectListener = (status: WebSocketStatus) => {
        if (status !== 'connected') return;

        // pending 상태 확인 (취소되었으면 구독하지 않음)
        if (!this.pendingSubscriptions.has(subscriptionId)) {
          // console.log('[WebSocket] Subscription cancelled before connection:', subscriptionId);
          return;
        }

        try {
          doSubscribe();
        } catch (error) {
          // console.error('[WebSocket] doSubscribe failed:', error);
        } finally {
          // 성공/실패 관계없이 pending에서 제거
          this.removeFromPending(subscriptionId);
        }
      };

      this.addToPending(subscriptionId, destination, callback, connectListener);
    }

    return subscriptionId;
  }

  /**
   * 구독 해제
   */
  unsubscribe(subscriptionId: string): void {
    // pending 구독 취소 (연결 전 구독 제거)
    this.removeFromPending(subscriptionId);

    // 활성 구독 해제
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      // console.log('[WebSocket] Unsubscribed:', subscriptionId);
    }
  }

  /**
   * 메시지 발행
   */
  publish(destination: string, body: unknown): void {
    if (!this.client?.connected) {
      // console.error('[WebSocket] Cannot publish: not connected');
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
      // console.log('[WebSocket] Published to:', destination);
    } catch (error) {
      // console.error('[WebSocket] Publish error:', error);
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
    // console.log('[WebSocket] Resubscribing to all topics...');
    // 구독은 useWebSocket 훅에서 자동으로 다시 등록됨
  }

  /**
   * pending 큐에 구독 추가
   */
  private addToPending(
    subscriptionId: string,
    destination: string,
    callback: (message: IMessage) => void,
    connectListener: (status: WebSocketStatus) => void
  ): void {
    this.pendingSubscriptions.set(subscriptionId, { destination, callback });
    this.pendingListeners.set(subscriptionId, connectListener);
    this.addStatusListener(connectListener);

    if (import.meta.env.DEV) {
      this.validatePendingSync();
      // console.log('[WebSocket] Added to pending:', {
      //   subscriptionId,
      //   destination,
      //   pendingCount: this.pendingSubscriptions.size,
      // });
    }
  }

  /**
   * pending 큐에서 구독 제거
   */
  private removeFromPending(subscriptionId: string): void {
    if (!this.pendingSubscriptions.has(subscriptionId)) return;

    const listener = this.pendingListeners.get(subscriptionId);
    if (listener) {
      this.removeStatusListener(listener);
    }

    this.pendingSubscriptions.delete(subscriptionId);
    this.pendingListeners.delete(subscriptionId);

    if (import.meta.env.DEV) {
      this.validatePendingSync();
      // console.log('[WebSocket] Removed from pending:', {
      //   subscriptionId,
      //   pendingCount: this.pendingSubscriptions.size,
      // });
    }
  }

  /**
   * pending된 구독들 처리 (연결 완료 시)
   */
  private processPendingSubscriptions(): void {
    if (this.pendingSubscriptions.size === 0) return;

    // console.log('[WebSocket] Processing pending subscriptions:', this.pendingSubscriptions.size);

    // pending listener들 실행
    this.pendingListeners.forEach((listener, subscriptionId) => {
      if (this.pendingSubscriptions.has(subscriptionId)) {
        try {
          listener('connected');
        } catch (error) {
          // console.error(`[WebSocket] Failed to process pending subscription ${subscriptionId}:`, error);
        }
      }
    });
  }

  /**
   * pending 동기화 검증 (개발 모드)
   */
  private validatePendingSync(): void {
    if (this.pendingSubscriptions.size !== this.pendingListeners.size) {
      // console.error(
      //   '[WebSocket] Pending sync error:',
      //   'subscriptions:', this.pendingSubscriptions.size,
      //   'listeners:', this.pendingListeners.size
      // );
    }
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
      useWebSocketStore.getState().setStatus('disconnected');
      useWebSocketStore.getState().clearError();
      // console.log('[WebSocket] Disconnected manually');
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
