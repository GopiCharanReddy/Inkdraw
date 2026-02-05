import { authClient } from "@repo/auth/client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { config } from "../../config";
import useWebSocket from "../hooks/useWebsocket";
import { DrawActions, Shape } from "@repo/schema";
import { initDraw } from "@/draw";
import { sendWSMessage } from "../socket/socketManager";
import { useShapeStore } from "../store/store";
import ToolBar from "../Toolbar/ToolBar";
import { knewave } from "@/app/layout";
import { LoaderFive } from "../ui/loader";

interface CanvasRoom {
  roomId: string;
  token: string
}
const CanvasRoom = ({ roomId, token }: CanvasRoom) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawActionsRef = useRef<DrawActions | null>(null);
  const hasJoinedRoom = useRef<boolean>(false);

  const WEBSOCKET_URL = `${config.NEXT_PUBLIC_WS_URL}?token=${token}`;
  const { isConnected, message } = useWebSocket(WEBSOCKET_URL || "", roomId);

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
    // Reset the flag when roomId changes
    hasJoinedRoom.current = false;
  }, [roomId]);

  useEffect(() => {
    if (isConnected && !hasJoinedRoom.current) {
      sendWSMessage({
        type: 'join_room',
        roomId: roomId,
      })
      hasJoinedRoom.current = true;
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

  if (!isConnected) {
    return (
      <LoaderFive text="Connecting to server..." />
    )
  }
  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col gap-y-20 items-center justify-center bg-neutral-50">
        <div>
          <canvas className={`block w-full h-full ${knewave.className}`} ref={canvasRef}></canvas>
          <ToolBar />
        </div>
      </div>
    </>
  )
}

export default CanvasRoom