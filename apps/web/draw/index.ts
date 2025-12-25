import axios from "axios";
import { DrawActions, Shape } from '@repo/schema';
import { sendWSMessage } from "../components/socketManager";
import { useCameraStore, useShapeStore, useToolStore } from "../components/store/store";
import { iconLibrary } from "../components/resources/icons";

export const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.beginPath()
  if (shape.type === 'rectangle') {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === 'diamond') {
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height / 2);
    ctx.closePath();
    ctx.stroke();
  } else if (shape.type === "circle") {
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (shape.type === 'line') {
    ctx.moveTo(shape.x, shape.y)
    ctx.lineTo(shape.width, shape.height) // here width/height are currentX/currentY i.e., endX/endY
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (shape.type === 'pencil') {
    if (!shape.points || shape.points.length < 2) return;
    ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y)
    }
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke();
  }
}
export const initDraw = async (
  canvas: HTMLCanvasElement,
  roomId: string
): Promise<DrawActions> => {
  let existingShapes: Shape[] = await getExistingShapes(roomId);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not found.");
  }
  let currentPencilPoints: { x: number, y: number }[] = [];

  // resets the camera
  const render = () => {
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const { shapes } = useShapeStore.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    existingShapes.forEach((shape) => drawShape(ctx, shape));
    ctx.restore();
  }
  // handling window resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  }
  window.addEventListener("resize", handleResize)
  handleResize();

  let clicked = false;
  // stored in world space
  let startX = 0;
  let startY = 0;

  const onMouseDown = (e: MouseEvent) => {
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    clicked = true;
    // convert screen coordinates to world coordinates
    startX = (e.clientX - offsetX) / scale;
    startY = (e.clientY - offsetY) / scale;

    const { activeTool } = useToolStore.getState();
    if (activeTool === 'pencil') {
      currentPencilPoints = [{ x: startX, y: startY }]
    }
  }
  const onMouseUp = (e: MouseEvent) => {
    clicked = false;
    const { activeTool } = useToolStore.getState();
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const selectedIcon = iconLibrary.find(icon => icon.name === activeTool);
    const shapeType = selectedIcon?.shapeType

    if (shapeType === 'hand') return;
    // calc current mouse position in world space
    const currentX = (e.clientX - offsetX) / scale;
    const currentY = (e.clientY - offsetY) / scale;
    const width = currentX - startX;
    const height = currentY - startY;

    render();

    let newShape: Shape | null = null;

    if (shapeType === 'circle') {
      const radius = Math.hypot(width, height)
      newShape = {
        type: "circle",
        centerX: startX,
        centerY: startY,
        radius
      }
    } else if (shapeType === 'rectangle' || shapeType === 'diamond') {
      newShape = {
        type: shapeType,
        x: startX,
        y: startY,
        width,
        height
      }
    } else if (shapeType === 'line') {
      newShape = {
        type: shapeType,
        x: startX,
        y: startY,
        width: currentX,
        height: currentY
      }
    } else if (shapeType === 'pencil') {
      newShape = {
        type: 'pencil',
        points: [...currentPencilPoints],
      }
      currentPencilPoints = [];
    }
    if (newShape) {
      useShapeStore.getState().addShape(newShape)

      sendWSMessage({
        type: 'chat',
        message: JSON.stringify(newShape),
        roomId: roomId
      })
    }
    render();
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;

    const { activeTool } = useToolStore.getState();
    const { offsetX, offsetY, scale, setOffset } = useCameraStore.getState();
    const selectedIcon = iconLibrary.find(icon => icon.name === activeTool);
    let shapeType = selectedIcon?.shapeType

    if (shapeType === 'hand') {
      setOffset(e.clientX - startX * scale, e.clientY - startY * scale);
      render();
      return;
    }
    // handle shape drawing preview drawing background shapes first
    render();
    // calc current mouse position in world space
    const currentX = (e.clientX - offsetX) / scale;
    const currentY = (e.clientY - offsetY) / scale;
    const width = currentX - startX;
    const height = currentY - startY;

    render();
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale)
    ctx.strokeStyle = "rgba(10, 10, 10)";

    if (shapeType === 'circle') {
      const radius = Math.hypot(width, height)
      drawShape(ctx, {
        type: 'circle',
        centerX: startX,
        centerY: startY,
        radius,
      })
    } else if (shapeType === 'diamond' || shapeType === 'rectangle') {
      drawShape(ctx, {
        type: shapeType,
        x: startX,
        y: startY,
        width,
        height
      })
    } else if (shapeType === 'line') {
      drawShape(ctx, {
        type: shapeType,
        x: startX,
        y: startY,
        width: currentX,
        height: currentY
      })
    } else if (shapeType === 'pencil') {
      currentPencilPoints.push({ x: currentX, y: currentY })
      render();
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      drawShape(ctx, {
        type: 'pencil',
        points: currentPencilPoints
      }
      )
      ctx.restore();
    }
    ctx.restore();
  }
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const { offsetX, offsetY, scale, setOffset, setScale } = useCameraStore.getState();

    if (e.ctrlKey) {
      const zoomSensitivity = 0.005;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, scale + delta), 10);

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newX = mouseX - (mouseX - offsetX) * (newScale / scale)
      const newY = mouseY - (mouseY - offsetY) * (newScale / scale)
      setScale(newScale);
      setOffset(newX, newY);
    } else {
      setOffset(offsetX - e.deltaX, offsetY - e.deltaY)
    }
    render
  }

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('wheel', onWheel, { passive: false })

  return {
    cleanup: () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
    },
    handleAddRemoteShape: (s: Shape) => {
      existingShapes.push(s);
      render();
    }
  }
}

const getExistingShapes = async (roomId: string) => {
  console.log("Getting existing shapes")
  try {
    const res = await axios.get(`http://localhost:8080/api/v1/chat/${roomId}`, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    });
    const messages = res.data.messages;
    console.log("Messages is :", messages);

    const shapes = messages.map((x: { content: string }) => {
      return JSON.parse(x.content);
    })
    return shapes;
  } catch (error) {
    console.error("Error fetching shapes: ", error);
    return [];
  }
}