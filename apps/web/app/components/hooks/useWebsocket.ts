import { useCallback, useEffect, useRef, useState } from "react";
import { intitWebsocket, sendWSMessage } from "../socketManager";
import { IncomingWsData } from "@repo/schema";

const useWebSocket = (url: string) => {
  const [ isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<IncomingWsData | null>(null);

  useEffect(() => {
    if (!url || typeof window === 'undefined') return;

    const socket = intitWebsocket(url, (data) => {
      setMessage(data);
    })
    if(!socket) return;

    const checkInterval = setInterval(() => {
      setIsConnected(socket.readyState === WebSocket.OPEN)
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, [url])

  return {isConnected, message, sendMessage: sendWSMessage}
}

export default useWebSocket;