import axios from "axios";
import { DraftShape, DrawActions, Shape } from '@repo/schema';
import { sendWSMessage } from "../components/socketManager";
import { useCameraStore, useShapeStore, useToolStore } from "../components/store/store";
import { iconLibrary } from "../components/resources/icons";

export const drawShape = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
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
  const { setShapes } = useShapeStore.getState();
  const initialShapes = await getExistingShapes(roomId)
  setShapes(initialShapes);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not found.");
  }
  let currentPencilPoints: { x: number, y: number }[] = [];
  let tailPoints: { x: number, y: number }[] = [];
  const tailLength = 5;

  // resets the camera
  const render = () => {
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const { shapes } = useShapeStore.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "rgba(0, 0, 0)"
    ctx.lineWidth = 2 / scale;
    shapes.forEach((shape) => drawShape(ctx, shape));
    ctx.restore();
    if(tailPoints.length > 0) {
      drawTail(ctx, tailPoints, offsetX, offsetY, scale)
    }
  }

  const unsubscribeShapes = useShapeStore.subscribe(render);
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
    const { activeTool } = useToolStore.getState();
    clicked = true;
    // convert screen coordinates to world coordinates
    startX = (e.clientX - offsetX) / scale;
    startY = (e.clientY - offsetY) / scale;

    if (activeTool === 'pencil') {
      currentPencilPoints = [{ x: startX, y: startY }]
    }
    ctx.lineWidth = 2 / scale;
  }

  const onMouseUp = (e: MouseEvent) => {
    clicked = false;
    const { activeTool } = useToolStore.getState();
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const selectedIcon = iconLibrary.find(icon => icon.name === activeTool);
    const shapeType = selectedIcon?.shapeType
    
    if (shapeType === 'hand' || shapeType === 'eraser'){
      tailPoints = [];
      render();
      return;
    }
    // calc current mouse position in world space
    const currentX = (e.clientX - offsetX) / scale;
    const currentY = (e.clientY - offsetY) / scale;
    const width = currentX - startX;
    const height = currentY - startY;
    
    
    render();
    let newShape: DraftShape | null = null;

    if (shapeType === 'circle') {
      const radius = Math.hypot(width, height)
      newShape = {
        type: shapeType,
        centerX: startX,
        centerY: startY,
        radius
      }
    } else if (shapeType === 'rectangle' || shapeType === 'diamond' || shapeType === 'rhombus') {
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
      const shapeWithId  = {
        ...newShape,
        id: crypto.randomUUID()
      };
      useShapeStore.getState().addShape(shapeWithId)

      sendWSMessage({
        type: 'chat',
        message: JSON.stringify(shapeWithId),
        roomId: roomId
      })
    }
    render();
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;

    const { activeTool } = useToolStore.getState();
    const { offsetX, offsetY, scale, setOffset } = useCameraStore.getState();
    const { shapes, deleteShape } = useShapeStore.getState();
    const shapeType = iconLibrary.find(icon => icon.name === activeTool)?.shapeType;
    
    
    // calc current mouse position in world space
    const currentX = (e.clientX - offsetX) / scale;
    const currentY = (e.clientY - offsetY) / scale;
    const width = currentX - startX;
    const height = currentY - startY;

    ctx.lineWidth = 2 / scale;
    if (shapeType === 'hand') {
      setOffset(e.clientX - startX * scale, e.clientY - startY * scale);
      render();
      return;
    }

    if(shapeType === "eraser") {
      tailPoints.push({ x: currentX, y: currentY })
      if (tailPoints.length > tailLength) {
        tailPoints.shift();
      }

      const shapeToDelete = shapes.find(s => isPointInShape(currentX, currentY, s))
      if (shapeToDelete) {
        deleteShape(shapeToDelete.id)
        sendWSMessage({
          type: 'chat',
          message: JSON.stringify({
            ...shapeToDelete,
            isDeleted: true // Add this flag
          }),
          roomId
        });
      }
      drawTail(ctx, tailPoints, offsetX, offsetY, scale);
      render();
      return;
    }

    // handle shape drawing preview drawing background shapes first
    render();
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale)
    ctx.strokeStyle = "rgba(10, 10, 10)";

    if (shapeType === 'circle') {
      const radius = Math.hypot(width, height)
      drawShape(ctx, {
        type: shapeType,
        centerX: startX,
        centerY: startY,
        radius,
      })
    } else if (shapeType === 'diamond' || shapeType === 'rectangle' || shapeType === 'rhombus') {
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
      drawShape(ctx, {
        type: 'pencil',
        points: currentPencilPoints
      })
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
    render();
  }

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('wheel', onWheel, { passive: false })

  return {
    cleanup: () => {
      unsubscribeShapes();
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
    },
    handleAddRemoteShape: (s: Shape) => {
      const { shapes } = useShapeStore.getState();
      if(s.isDeleted) {
        useShapeStore.setState({
          shapes: shapes.filter(existing => existing.id !== s.id)
        })
      } else {
        if(!shapes.find((existing) => existing.id === s.id)) {
          useShapeStore.setState({ shapes: [...shapes, s]})
        }
      }
      useShapeStore.setState((state) => ({
        shapes: [...state.shapes, s]
      }))
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


const isPointInShape = (x: number, y: number, shape: Shape): boolean => {
  const threshold = 5;
  //  "rectangle" | "diamond" | "rhombus" | "triangle" | "hexagon" | "star" | "heart" | "line" | "laser";
  if (shape.type === 'rectangle') {
    const left = Math.min(shape.x, shape.x + shape.width)
    const right = Math.max(shape.x, shape.x + shape.width)
    const top = Math.min(shape.y, shape.y + shape.height)
    const bottom = Math.max(shape.y, shape.y + shape.height)
    return x >= left && x <= right && y >= top && y <= bottom;
  }
  if (shape.type === 'rhombus' || shape.type === 'diamond') {
    const centerX = shape.x + shape.width / 2
    const centerY = shape.y + shape.height / 2
    const dx = Math.abs(x - centerX) / (shape.width / 2);
    const dy = Math.abs(y - centerY) / (shape.height / 2);
    return (dx + dy) <= 1;
  }
  if (shape.type === 'circle') {
    const distance = Math.hypot(x - shape.centerX, y - shape.centerY);
    return distance <= shape.radius;
  }

  if (shape.type === 'pencil') {
    return shape.points.some((p, i) => {
      if (i == 0) return false;
      const prev = shape.points[i - 1];
      return distToSegment({ x, y }, prev, p) < threshold;
    })
  }
  if (shape.type === 'line') {
    return distToSegment({ x, y }, { x: shape.x, y: shape.y }, { x: shape.width, y: shape.height }) < threshold
  }
  return false;
}
type HitDetect = {
  p: {
    x: number,
    y: number
  }
  v: {
    x: number,
    y: number
  }
  w: {
    x: number,
    y: number
  }
}
const distToSegment = (p: any, v: any, w: any) => {
  const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  if (l2 == 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

const drawTail = (ctx: CanvasRenderingContext2D, tailPoints: { x: number, y: number }[], offsetX: number, offsetY: number, scale: number) => {
  if (tailPoints.length < 2) return;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(tailPoints[0]!.x, tailPoints[0]!.y);

  for (let i = 0; i < tailPoints.length; i++) {
    ctx.lineTo(tailPoints[i]!.x, tailPoints[i]!.y)
  }

  ctx.strokeStyle = "rgba(180, 180, 180, 0.5)";
  ctx.lineWidth = 6 / scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(245, 245, 245, 0.7)";

  ctx.stroke();
  ctx.restore();
}