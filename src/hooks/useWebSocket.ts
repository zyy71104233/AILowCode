import { useState, useEffect, useCallback } from 'react';
import { MessageItem, WebSocketStage } from '../types/types';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<{
    stage: WebSocketStage;
    currentMessage?: MessageItem;
  }>({ stage: 'prd' });
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
      setIsConnected(true);
      messageQueue.forEach(msg => ws.send(JSON.stringify(msg)));
      setMessageQueue([]);
    };

    ws.onmessage = (event) => {
      try {
        const data: MessageItem = JSON.parse(event.data);
        setSession(prev => ({
          ...prev,
          currentMessage: data
        }));
      } catch (error) {
        console.error('消息解析失败:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket断开连接');
      setSocket(null);
      setIsConnected(false);
    };

    return () => ws.close();
  }, [url, messageQueue]);

  const send = useCallback((data: any) => {
    if (isConnected && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      setMessageQueue(prev => [...prev, data]);
      console.warn('未连接，消息已加入队列');
    }
  }, [socket, isConnected]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { socket, isConnected, session, send };
};