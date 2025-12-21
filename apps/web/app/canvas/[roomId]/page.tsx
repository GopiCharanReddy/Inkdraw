"use client";
import { useEffect, useRef, useState } from "react";
import { drawShape, initDraw } from "../../../draw";
import { Button } from "@repo/ui/button";
import { useParams } from "next/navigation";
import useWebSocket from "../../components/hooks/useWebsocket";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<'rect' | 'diamond' | 'circle'>('rect');
  const [token, setToken] = useState<string>();
  const toolRef = useRef(currentTool);
  const params = useParams();
  const roomId = params.roomId as string;
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken.split('Bearer ')[1]);
    }
  }, []);

  useEffect(() => {
    toolRef.current = currentTool;
  }, [currentTool]);

  const WEBSOCKET_URL = token ? `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}` : null;
  const { isConnected, message, sendMessage } = useWebSocket(WEBSOCKET_URL || "");


  useEffect(() => {
    if (canvasRef.current && isConnected) {
      const canvas = canvasRef.current;

      let cleanUpFn: (() => void) | undefined;
      const cleanup = initDraw(canvas, () => toolRef.current, roomId)
      return () => {
        if (cleanUpFn) {
          cleanUpFn();
        }
      }
    }
  }, [isConnected, roomId]);

  useEffect(() => {
    if (message && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      try {
        const data = typeof message === 'string' ? JSON.parse(message) : message;

        if (data.type === 'chat') {
          const newShape = JSON.parse(data.message);

          ctx.strokeStyle = "rgba(255, 255, 255)";
          ctx.fillStyle = "rgba(10, 10, 10)";
          drawShape(ctx, newShape);
        }
      } catch (e) {
        console.error("Error drawing incoming shape:", e);
      }
    }
  }, [message]);
  if (!token) return <div className="bg-black h-screen text-white p-4">Authenticating...</div>;

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-neutral-950">
        {isConnected ?
          <div>
            <canvas className="block w-full h-full" ref={canvasRef}></canvas>
            <div className="absolute bottom-6 right-[40%] bg-white gap-x-5 flex p-4 text-xl items-center justify-center">
              <Button onClick={() => { setCurrentTool('rect') }} children='Rectangle' />
              <Button onClick={() => { setCurrentTool('diamond') }} children='Diamond' />
              <Button onClick={() => { setCurrentTool('circle') }} children='Circle' />
            </div>
          </div>
          :
          <div className="w-fit h-fit p-4 bg-white">
            isLoading
          </div>}
      </div>
    </>
  )
}

export default Canvas;