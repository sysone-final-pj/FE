import { useEffect, useState, useCallback, useRef } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { stompClient } from '@/shared/lib/websocket/stompClient';
import type { WebSocketStatus, WebSocketError } from '@/shared/types/websocket';

/**
 * 범용 웹소켓 훅 옵션
 */
interface UseWebSocketOptions {
  /** 구독할 토픽 경로 */
  destination: string;
  /** 메시지 수신 시 콜백 */
  onMessage?: (message: IMessage) => void;
  /** 컴포넌트 마운트 시 자동 연결 여부 (기본: true) */
  autoConnect?: boolean;
  /** 컴포넌트 언마운트 시 자동 연결 해제 여부 (기본: false) */
  autoDisconnect?: boolean;
}

/**
 * 범용 웹소켓 훅
 *
 * @example
 * ```tsx
 * const { status, error, send } = useWebSocket({
 *   destination: '/topic/dashboard',
 *   onMessage: (message) => {
 *     console.log('Received:', message.body);
 *   }
 * });
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const {
    destination,
    onMessage,
    autoConnect = true,
    autoDisconnect = false,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [error, setError] = useState<WebSocketError | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);
  const onMessageRef = useRef(onMessage);

  // onMessage 콜백 업데이트 (최신 상태 유지)
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  /**
   * 웹소켓 연결
   */
  const connect = useCallback(() => {
    stompClient.connect();
  }, []);

  /**
   * 웹소켓 연결 해제
   */
  const disconnect = useCallback(() => {
    if (subscriptionIdRef.current) {
      stompClient.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
    stompClient.disconnect();
  }, []);

  /**
   * 메시지 전송
   */
  const send = useCallback((sendDestination: string, body: unknown) => {
    stompClient.publish(sendDestination, body);
  }, []);

  /**
   * 상태 변경 리스너
   */
  useEffect(() => {
    const statusListener = (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
    };

    stompClient.addStatusListener(statusListener);
    return () => {
      stompClient.removeStatusListener(statusListener);
    };
  }, []);

  /**
   * 에러 리스너
   */
  useEffect(() => {
    const errorListener = (newError: WebSocketError) => {
      setError(newError);
    };

    stompClient.addErrorListener(errorListener);
    return () => {
      stompClient.removeErrorListener(errorListener);
    };
  }, []);

  /**
   * 자동 연결 및 구독
   */
  useEffect(() => {
    if (!autoConnect) return;

    // 연결 시작
    connect();

    // 구독
    const handleMessage = (message: IMessage) => {
      if (onMessageRef.current) {
        onMessageRef.current(message);
      }
    };

    subscriptionIdRef.current = stompClient.subscribe(destination, handleMessage);

    // 클린업
    return () => {
      if (subscriptionIdRef.current) {
        stompClient.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }

      if (autoDisconnect) {
        disconnect();
      }
    };
  }, [destination, autoConnect, autoDisconnect, connect, disconnect]);

  return {
    /** 현재 연결 상태 */
    status,
    /** 발생한 에러 (없으면 null) */
    error,
    /** 연결되어 있는지 여부 */
    isConnected: status === 'connected',
    /** 웹소켓 연결 */
    connect,
    /** 웹소켓 연결 해제 */
    disconnect,
    /** 메시지 전송 */
    send,
  };
}
