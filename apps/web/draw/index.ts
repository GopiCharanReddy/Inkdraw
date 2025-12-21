import axios from "axios";

type Shape = | {
  type: "rect" | "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
}
  | {
    type: 'circle';
    centerX: number;
    centerY: number;
    radius: number;
  }
const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
  ctx.beginPath()
  if (shape.type === 'rect') {
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === 'diamond') {
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape.type === "circle") {
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}
export const initDraw = async (canvas: HTMLCanvasElement, getTool: () => string, roomId: string) => {
  let existingShapes: Shape[] = await getExistingShapes(roomId);
  console.log(existingShapes);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearCanvas(existingShapes, canvas, ctx);
    ctx.strokeStyle = "rgba(255, 255, 255)";
    ctx.fillStyle = "rgba(10, 10, 10)";
    existingShapes.forEach((shape) => drawShape(ctx, shape));
  }
  handleResize();
  window.addEventListener("resize", handleResize)
  clearCanvas(existingShapes, canvas, ctx);
  let clicked = false;
  let startX = 0;
  let startY = 0;
  const onMouseDown = (e: MouseEvent) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  }
  const onMouseUp = (e: MouseEvent) => {
    clicked = false;
    const currentTool = getTool();
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    if (currentTool === 'circle') {
      const radius = Math.hypot(width, height)
      existingShapes.push({
        type: "circle",
        centerX: startX,
        centerY: startY,
        radius
      })
    } else if (currentTool === 'rect' || currentTool === 'diamond') {
      existingShapes.push({
        type: currentTool,
        x: startX,
        y: startY,
        width,
        height
      })
    }
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!clicked) return;
    const currentTool = getTool();
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    clearCanvas(existingShapes, canvas, ctx)
    ctx.strokeStyle = "rgba(255, 255, 255)"
    ctx.fillStyle = "rgba(10, 10, 10)"
    if (currentTool === 'circle') {
      const radius = Math.hypot(width, height)
      drawShape(ctx, {
        type: 'circle',
        centerX: startX,
        centerY: startY,
        radius,
      })
    } else if (currentTool === 'diamond' || currentTool === 'rect') {
      drawShape(ctx, {
        type: currentTool,
        x: startX,
        y: startY,
        width,
        height
      })
    }
  }
  
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);

  return () => {
    window.removeEventListener("resize", handleResize);
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
  };
}

const clearCanvas = (existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255)"
  ctx.fillStyle = "rgba(10, 10, 10)"
  existingShapes.forEach((shape) => {
    drawShape(ctx, shape)
  })
}

const getExistingShapes = async (roomId: string) => {
  console.log("Getting existing shapes")
  const res = await axios.get(`http://localhost:8080/api/v1/chat/${roomId}`, {
    headers: {
      Authorization: localStorage.getItem('token')
    }
  });
  const messages = res.data.messages;

  const shapes = messages.map((x: {message: string}) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  })
  return shapes;
}