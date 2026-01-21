import axios from "axios";
import { DraftShape, DrawActions, Shape } from '@repo/schema';
import { sendWSMessage } from "../components/socketManager";
import { useCameraStore, useShapeStore, useToolStore } from "../components/store/store";
import { iconLibrary } from "../components/resources/icons";
import { knewave } from "../app/layout";

const imageCache = new Map<string, HTMLImageElement>();

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
  } else if (shape.type === 'text') {
    ctx.font = `${shape.fontSize}px ${knewave.style.fontFamily}`;
    ctx.textBaseline = 'middle';
    // ctx.fillText(shape.content!, shape.x, shape.y);
    const padding = 10;
    const lineHeight = shape.fontSize! * 1.2; // multiply by 1.2 to match the HTMl textarea default 
    const maxWidth = (shape.width || 0) - (padding * 2);


    const paragraphs = (shape.content || "").split('\n');
    let x = shape.x + padding;
    let y = shape.y + padding + (lineHeight / 2);

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(" ");
      let line = "";
      for (let n = 0; n < words.length; n++) {
        const testline = line + words[n] + ' ';
        const metrics = ctx.measureText(testline);
        const testWidth = metrics.width;
        if (maxWidth > 0 && testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testline;
        }
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
    })
  } else if (shape.type === 'image' && shape.imgUrl) {
    let img = imageCache.get(shape.imgUrl);
    if (!img) {
      img = new Image();
      img.src = shape.imgUrl;
      imageCache.set(shape.imgUrl, img)
      img.onload = () => {
        if (!img) return;
        ctx.drawImage(img, shape.x, shape.y, shape.width!, shape.height!);
      }
      img.onerror = () => {
        console.error("Failed to load image: ", shape.imgUrl);
        imageCache.delete(shape.imgUrl!);
      }
    }
    if (img.complete && img.naturalWidth > 0) {
      try {
        ctx.drawImage(img, shape.x, shape.y, shape.width!, shape.height!);
      } catch (error) {
        console.error("Error drawing image: ", error)
      }
    }
  } else if (shape.type === 'note') {
    ctx.fillStyle = '#ffff88';
    ctx.textBaseline = "top";
    ctx.font = `16px ${knewave.style.fontFamily}`;
    ctx.fillRect(shape.x, shape.y, shape.width!, shape.height!);
    ctx.fillStyle = '#000';
    ctx.shadowBlur = 15;
    const padding = 10;
    const lineHeight = 20;
    const maxWidth = shape.width! - (padding * 2);

    const paragraphs = (shape.content || "").split('\n');
    let x = shape.x + padding;
    let y = shape.y + padding;

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(" ");
      let line = "";
      for (let n = 0; n < words.length; n++) {
        const testline = line + words[n] + ' ';
        const metrics = ctx.measureText(testline);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testline;
        }
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
    })
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
  let clicked = false;
  let isTyping = false;
  // let existingTextId: string | null = null;  text logic
  let selectedShapeId: string | null = null;
  let dragOffset = { x: 0, y: 0 };
  let isDragging = false;
  // stored in world space
  let startX = 0;
  let startY = 0;
  canvas.style.cursor = 'default';
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
    if (tailPoints.length > 0) {
      drawTail(ctx, tailPoints, offsetX, offsetY, scale)
    }
    canvas.style.cursor = 'default'
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

  // logic used for using backspace & enter keys for shapetype text 
  // const handleKeyDown = (e: KeyboardEvent) => {
  //   if (!existingTextId) return;
  //   //prevents default of browser going back to previous page
  //   if (e.key === 'Backspace' || e.key === ' ') e.preventDefault();

  //   const store = useShapeStore.getState();
  //   const shapes = store.shapes;
  //   const shapeIndex = shapes.findIndex(s => s.id === existingTextId);
  //   if (shapeIndex === -1) return;

  //   const currentShape = shapes[shapeIndex];
  //   // if (currentShape && currentShape.type === 'text') {
  //   //   let newText = currentShape.content!.replace('|', '');

  //   //   if (e.key === 'Backspace') {
  //   //     newText = newText.slice(0, -1);
  //   //   } else if (e.key === 'Enter') {
  //   //     existingTextId = null;
  //   //     const finalShapes = [...store.shapes];
  //   //     finalShapes[shapeIndex] = { ...currentShape, content: newText }
  //   //     useShapeStore.setState({ shapes: finalShapes })
  //   //     render();
  //   //     return;
  //   //   } else if (e.key.length === 1) {
  //   //     newText += e.key;
  //   //   }
  //   //   const updatedShapes = [...store.shapes];
  //   //   updatedShapes[shapeIndex] = { ...currentShape, content: newText + '|' };
  //   //   useShapeStore.setState({
  //   //     shapes: updatedShapes
  //   //   })

  //   //   sendWSMessage({
  //   //     type: 'chat',
  //   //     message: JSON.stringify(updatedShapes[shapeIndex]),
  //   //     roomId
  //   //   })
  //   // }
  // };

  const onMouseDown = (e: MouseEvent) => {
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const { activeTool } = useToolStore.getState();
    const { shapes } = useShapeStore.getState();
    const shapeType = iconLibrary.find(icon => icon.name === activeTool)?.shapeType;
    clicked = true;
    if (isTyping) return;
    // convert screen coordinates to world coordinates
    startX = (e.clientX - offsetX) / scale;
    startY = (e.clientY - offsetY) / scale;
    if (shapeType === 'pencil') {
      currentPencilPoints = [{ x: startX, y: startY }]
      ctx.lineWidth = 2 / scale;
    }
    if (shapeType === 'hand') {
      canvas.style.cursor = 'grab';
    }
    /*for shape type text
      if (existingTextId) {
        const store = useShapeStore.getState();
        const idx = store.shapes.findIndex((s) => s.id === existingTextId);
        if (idx !== -1) {
          const shape = store.shapes[idx];
          if (shape && shape.type === 'text') {
            shapes[idx] = { ...shape, content: shape.content?.replace('|', '') };
            useShapeStore.setState({ shapes });
          }
        }
        existingTextId = null;
      }*/
    if (shapeType === 'select') {
      const hit = [...shapes].reverse().find(s => isPointInShape(startX, startY, s));
      if (hit) {
        selectedShapeId = hit.id;
        isDragging = true;
        if ('x' in hit && 'y' in hit) {
          dragOffset = { x: startX - hit.x, y: startY - hit.y }
        } else if (hit.type === 'circle') {
          dragOffset = { x: startX - hit.centerX, y: startY - hit.centerY }
        }
      } else {
        selectedShapeId = null;
      }
    }

    if (shapeType === 'text') {
      isTyping = true;
      const noteX = startX;
      const noteY = startY;
      const fontSize = 24 * scale;
      const input = document.createElement('textarea');
      input.style.position = 'fixed';
      input.style.left = `${e.clientX}px`;
      input.style.top = `${e.clientY}px`;
      input.style.background = 'transparent';
      input.style.border = "none";
      input.style.outline = "none";
      input.style.overflow = "hidden";
      input.style.color = "black";
      input.style.resize = "none";
      input.style.font = `${fontSize}px ${knewave.style.fontFamily}`;
      input.style.lineHeight = `${fontSize * 1.2}px`;
      input.style.margin = "0";
      input.style.padding = "10px";
      input.style.whiteSpace = "pre"  // force horizontal growth
      input.style.minWidth = "50px";
      input.style.minHeight = "1em";
      document.body.appendChild(input);

      setTimeout(() => input.focus(), 10);  // focusing an event immediately after creation may fail, hence the timeout

      input.onkeydown = (e) => {
        e.stopPropagation();
      }

      input.oninput = () => {
        input.style.width = "auto";
        input.style.height = "auto";

        input.style.height = `${input.scrollHeight}px`;
        input.style.width = `${input.scrollWidth}px`
      }
      input.onblur = () => {
        const content = input.value;
        if (content.trim()) {
          const id = crypto.randomUUID();
          const newShape: Shape = {
            type: shapeType,
            id,
            x: noteX,
            y: noteY,
            width: input.scrollWidth / scale,
            height: input.scrollHeight / scale,
            content,
            fontSize: 24,
          }
          useShapeStore.getState().addShape(newShape);
          sendWSMessage({
            type: 'chat',
            message: JSON.stringify(newShape),
            roomId
          })
        }
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
        isTyping = false;
      }
      return;
      // const id = crypto.randomUUID();
      // const newShape: Shape = {
      //   id,
      //   type: 'text',
      //   x: startX,
      //   y: startY,
      //   content: '|',
      //   fontSize: 24 / scale,
      // }
      // existingTextId = id
      // useShapeStore.getState().addShape(newShape);
      // return;
    }
    if (shapeType === 'image') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file)

        const res = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/v1/upload`, formData);
        const imgUrl = res.data.imgUrl;

        const newShape: Shape = {
          id: crypto.randomUUID(),
          type: 'image',
          x: startX,
          y: startY,
          imgUrl,
          width: 300,
          height: 300,
        }
        useShapeStore.getState().addShape(newShape);
        sendWSMessage({
          type: 'chat',
          message: JSON.stringify(newShape),
          roomId
        })
      }
      input.click();
      return;
    }

    if (shapeType === 'note') {
      isTyping = true;
      const noteX = startX;
      const noteY = startY;
      const input = document.createElement('textarea');
      input.style.position = 'fixed';
      input.style.left = `${e.clientX}px`;
      input.style.top = `${e.clientY}px`;
      input.style.background = "#ffff88";
      input.style.border = "2px solid black";
      input.style.borderRadius = "5px";
      input.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
      input.style.width = "200px";
      input.style.minHeight = "200px";
      input.style.zIndex = "1000";
      document.body.appendChild(input);

      setTimeout(() => input.focus(), 10);

      input.oninput = () => {
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}`;
      }

      input.onblur = () => {
        const content = input.value;
        if (content.trim()) {
          const id = crypto.randomUUID();
          const newShape: Shape = {
            type: shapeType,
            id,
            x: noteX,
            y: noteY,
            width: 200,
            height: input.scrollHeight / scale,
            content,
          }
          useShapeStore.getState().addShape(newShape);
          sendWSMessage({
            type: 'chat',
            message: JSON.stringify(newShape),
            roomId
          })
        }
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
        isTyping = false;
      }
      return;
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    clicked = false;
    const { activeTool } = useToolStore.getState();
    const { offsetX, offsetY, scale } = useCameraStore.getState();
    const selectedIcon = iconLibrary.find(icon => icon.name === activeTool);
    const shapeType = selectedIcon?.shapeType

    if (shapeType === 'hand' || shapeType === 'eraser') {
      tailPoints = [];
      render();
      if (shapeType === 'eraser') {
        canvas.style.cursor = 'grab'
      }
      return;
    }
    // calc current mouse position in world space
    const currentX = (e.clientX - offsetX) / scale;
    const currentY = (e.clientY - offsetY) / scale;
    const width = currentX - startX;
    const height = currentY - startY;

    render();
    let newShape: DraftShape | null = null;

    if (isDragging && selectedShapeId) {
      const shape = useShapeStore.getState().shapes.find(s => s.id === selectedShapeId);
      if (shape) {
        sendWSMessage({
          type: 'chat',
          message: JSON.stringify(shape),
          roomId
        })
      }
      isDragging = false;
      return;
    }
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
      const shapeWithId = {
        ...newShape,
        id: crypto.randomUUID(),
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

    if (shapeType === 'select' && isDragging && selectedShapeId) {
      const store = useShapeStore.getState();
      const shapes = [...store.shapes];
      const idx = shapes.findIndex(s => s.id === selectedShapeId);
      if (idx !== -1) {
        const target = shapes[idx];
        if (target) {
          if ('x' in target && 'y' in target) {
            shapes[idx] = { ...target, x: currentX - dragOffset.x, y: currentY - dragOffset.y };
          } else if (target.type === 'circle') {
            shapes[idx] = { ...target, centerX: currentX - dragOffset.x, centerY: currentY - dragOffset.y }
          }
          useShapeStore.setState({ shapes })
        }
        return;
      }
    }
    if (shapeType === 'hand') {
      setOffset(e.clientX - startX * scale, e.clientY - startY * scale);
      render();
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (shapeType === "eraser") {
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
  // window.addEventListener('keydown', handleKeyDown);

  return {
    cleanup: () => {
      unsubscribeShapes();
      window.removeEventListener("resize", handleResize);
      // window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
    },
    handleAddRemoteShape: (s: Shape) => {
      const { shapes } = useShapeStore.getState();
      if (s.isDeleted) {
        useShapeStore.setState({
          shapes: shapes.filter(existing => existing.id !== s.id)
        })
      } else {
        if (!shapes.find((existing) => existing.id === s.id)) {
          useShapeStore.setState({ shapes: [...shapes, s] })
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
    const res = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_URL}/api/v1/chat/${roomId}`);
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
  if (shape.type === 'rectangle' || shape.type === 'image' || shape.type === 'note') {
    const width = shape.width || 0;
    const height = shape.height || 0;
    const left = Math.min(shape.x, shape.x + width)
    const right = Math.max(shape.x, shape.x + width)
    const top = Math.min(shape.y, shape.y + height)
    const bottom = Math.max(shape.y, shape.y + height)
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
      return distToSegment({ x, y }, prev!, p) < threshold;
    })
  }
  if (shape.type === 'line') {
    return distToSegment({ x, y }, { x: shape.x, y: shape.y }, { x: shape.width, y: shape.height }) < threshold
  }
  if (shape.type === 'text') {
    if (shape.width && shape.height) {
      return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height
    }
  }
  return false;
}

type HitDetect = {
  x: number;
  y: number
}
const distToSegment = (p: HitDetect, v: HitDetect, w: HitDetect) => {
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