"use client";
import { useEffect, useRef, useState } from "react";
import { initDraw } from "../../../draw";
import { useParams } from "next/navigation";
import useWebSocket from "../../../components/hooks/useWebsocket";
import { sendWSMessage } from "../../../components/socketManager";
import { DrawActions, Shape } from "@repo/schema";
import ToolBar from "../../../components/Toolbar/ToolBar";
import { useShapeStore } from "../../../components/store/store";
import { authClient } from '@repo/auth/client'
import { knewave } from "../../layout";

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [token, setToken] = useState<string>("");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const params = useParams();
  const roomId = params.roomId as string;

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await authClient.getSession();

      if (data?.session.token) {
        setToken(data.session.token)
      } else {
        setToken("")
      }
      setIsAuthChecked(true);
    }
    fetchSession();
  }, []);

  const WEBSOCKET_URL = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`;
  const { isConnected, message } = useWebSocket(WEBSOCKET_URL || "", roomId);
  const drawActionsRef = useRef<DrawActions | null>(null)

  useEffect(() => {
    let actionInstance: DrawActions | null = null;

    if (canvasRef.current && isConnected) {
      const canvas = canvasRef.current;
      initDraw(canvas, roomId)
        .then((actions) => {
          if (!canvasRef.current) {
            actions.cleanup();
            return;
          }
          drawActionsRef.current = actions;
          actionInstance = actions;
        })

      return () => {
        if (actionInstance) {
          actionInstance.cleanup();
        }
        drawActionsRef.current = null;
      }
    }
  }, [isConnected, roomId]);

  useEffect(() => {
    if (isConnected) {
      sendWSMessage({
        type: 'join_room',
        roomId: roomId,
      })
    }
  }, [isConnected, roomId])

  useEffect(() => {
    if (message && canvasRef.current && drawActionsRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      try {
        const data = typeof message === 'string' ? JSON.parse(message) : message;

        if (data.type === 'chat') {
          const shapeData: Shape = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;

          if (shapeData.isDeleted) {
            useShapeStore.setState((state) => ({
              shapes: state.shapes.filter(s => s.id !== shapeData.id)
            }));
          } else {
            const { shapes } = useShapeStore.getState();
            const exists = shapes.find(s => s.id === shapeData.id)
            if (exists) {
              useShapeStore.setState({
                shapes: shapes.map(s => s.id === shapeData.id ? shapeData : s)
              })
            } else {
              drawActionsRef.current.handleAddRemoteShape(shapeData);
            }
          }
        }
      } catch (e) {
        console.error("Error drawing incoming shape:", e);
      }
    }
  }, [message]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          console.log('redoing')
          useShapeStore.getState().redo();
        } else {
          console.log('undo')
          const lastShape = useShapeStore.getState().shapes[useShapeStore.getState().shapes.length - 1];
          sendWSMessage({
            type: 'chat',
            message: JSON.stringify({
              ...lastShape,
              isDeleted: true
            }),
            roomId: roomId
          })
          useShapeStore.getState().undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="h-screen w-screen overflow-hidden bg-neutral-50">
        {isConnected && isAuthChecked ?
          <div>
            <canvas className={`block w-full h-full ${knewave.className}`} ref={canvasRef}></canvas>
            <ToolBar />
          </div>
          :
          <div className="w-fit h-fit p-2 bg-white">
            isLoading
          </div>
        }
      </div>
    </>
  )
}

export default Canvas;