import { useCallback, useEffect, useRef, useState } from "react";
import { initWebsocket, sendWSMessage } from "../socket/socketManager";
import { IncomingWsData, WSMessage } from "@repo/schema";

const useWebSocket = (url: string, roomId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<IncomingWsData | null>(null);

  useEffect(() => {
    if (!url || typeof window === 'undefined') return;

    let socketIntance: WebSocket | null = null;

    const connect = () => {
      socketIntance = initWebsocket(url, roomId, (data) => {
        setMessage(data);
      });
    }

    connect();

    const checkInterval = setInterval(() => {
      if (socketIntance?.readyState === WebSocket.CLOSED) {
        console.log("Socket closed, attempting reconnect...");
        connect();
      }
      setIsConnected(socketIntance?.readyState === WebSocket.OPEN);
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [url, roomId])

  return { isConnected, message, sendWsMessage: sendWSMessage as (msg: WSMessage) => void }
}

export default useWebSocket;