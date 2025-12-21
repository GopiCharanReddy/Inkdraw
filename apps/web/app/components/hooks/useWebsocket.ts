import { useCallback, useEffect, useRef, useState } from "react";

const useWebSocket = (url: string) => {
  const [ isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState(null);
  const WebsocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url || typeof window === 'undefined') return;
    const ws = new WebSocket(url);
    WebsocketRef.current = ws;

    ws.onopen = () => {
      console.log("Websocket connection established.")
      setIsConnected(true)
    }

    ws.onmessage = (e) => {
      setMessage(e.data)
    }

    ws.onclose = () => {
      console.log("Websocket connection closed.")
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.log("Websocket connection error: ", error)
    }

    return () => {
      if(ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  }, [url])

  const sendMessage = useCallback((msg: string) => {
    const socket = WebsocketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    } else {
      console.error('WebSocket is not open. Current state:', socket?.readyState);
    }
  }, []);
  return {isConnected, message, sendMessage}
}

export default useWebSocket;