"use client";
import { useEffect, useRef, useState } from "react";
import { initDraw } from "../../../draw";
import { Button } from "@repo/ui/button";
import { useParams } from "next/navigation";

interface Pageprops {
  params: {
    roomId: string;
  }
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<'rect' | 'diamond' | 'circle'>('rect');
  const toolRef = useRef(currentTool);
  const params = useParams();
  const roomId = params.roomId as string;
  
  useEffect(() => {
    toolRef.current = currentTool;
  }, [currentTool]);

  useEffect(() => {
    if(canvasRef.current) {
      const canvas = canvasRef.current;

      let cleanUpFn: (() => void) | undefined;
      const startDrawing = async () => {
        const cleanup = initDraw(canvas, () => toolRef.current, roomId)
      }
      startDrawing();
      return () => {
        if(cleanUpFn){
          cleanUpFn();
        }
      }
    }
  }, []);
  return (
    <>
    <div className="h-screen w-screen overflow-hidden bg-neutral-950">
      <canvas className="block w-full h-full" ref={canvasRef}></canvas>
      <div className="absolute bottom-6 right-[40%] bg-white gap-x-5 flex p-4 text-xl items-center justify-center">
        <Button onClick={() => {setCurrentTool('rect')}} children='Rectangle'/>
        <Button onClick={() => {setCurrentTool('diamond')}} children='Diamond'/>
        <Button onClick={() => {setCurrentTool('circle')}} children='Circle'/>
      </div>
    </div>
    </>
  )
}

export default Canvas;