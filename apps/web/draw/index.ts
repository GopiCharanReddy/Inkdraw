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
  } else if (shape.type === 'circle') {
    ctx.arc(shape.centerX!, shape.centerY!, shape.radius!, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (shape.type === 'line') {
    ctx.moveTo(shape.x, shape.y)
    ctx.lineTo(shape.width, shape.height) // here width/height are currentX/currentY i.e., endX/endY
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (shape.type === 'pencil' || shape.type === 'highlight') {
    if (shape.type === 'highlight') {
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 20;
      ctx.strokeStyle = "#FFFF33";
    } else {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
    }
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
  } else if (shape.type === 'arrow') {
    let headlen = 10;
    let dx = shape.width - shape.x;
    let dy = shape.height - shape.y;
    let angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.width, shape.height);
    ctx.lineTo(shape.width - headlen * Math.cos(angle - Math.PI / 6), shape.height - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(shape.width, shape.height);
    ctx.lineTo(shape.width - headlen * Math.cos(angle + Math.PI / 6), shape.height - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  } else if (shape.type === 'arrowLeft' || shape.type === 'arrowRight' || shape.type === 'arrowUp' || shape.type === 'arrowDown') {
    let x = shape.x;
    let y = shape.y;
    let w = shape.width;
    let h = shape.height;
    if (w < 0) { x += w; w = Math.abs(w); }
    if (h < 0) { y += h; h = Math.abs(h); }
    const headLength = Math.min(w * 0.5, 80);
    const tailHeight = h * 0.5;
    // center the tail vertically
    const tailYOffset = (h - tailHeight) / 2;
    if (shape.type === 'arrowRight') {
      ctx.moveTo(x + w, y + h / 2);
      ctx.lineTo(x + w - headLength, y);
      ctx.lineTo(x + w - headLength, y + tailYOffset);
      ctx.lineTo(x, y + tailYOffset);
      ctx.lineTo(x, y + h - tailYOffset);
      ctx.lineTo(x + w - headLength, y + h - tailYOffset);
      ctx.lineTo(x + w - headLength, y + h);
    } else if (shape.type === 'arrowLeft') {
      // Tip of the arrow (Far Left Center)
      ctx.moveTo(x, y + h / 2);
      // Top Wing
      ctx.lineTo(x + headLength, y);
      // Top Inner Corner (Junction)
      ctx.lineTo(x + headLength, y + tailYOffset);
      // Top Back Corner (End of tail)
      ctx.lineTo(x + w, y + tailYOffset);
      // Bottom Back Corner
      ctx.lineTo(x + w, y + h - tailYOffset);
      // Bottom Inner Corner (Junction)
      ctx.lineTo(x + headLength, y + h - tailYOffset);
      // Bottom Wing
      ctx.lineTo(x + headLength, y + h);
    } else if (shape.type === 'arrowUp') {
      const headHeight = Math.min(h * 0.5, w);
      // Tail takes up 50% of WIDTH
      const tailWidth = w * 0.5;
      const tailXOffset = (w - tailWidth) / 2;
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x, y + headHeight);
      // Left Inner Corner
      ctx.lineTo(x + tailXOffset, y + headHeight);
      // Left Bottom Corner
      ctx.lineTo(x + tailXOffset, y + h);
      // Right Bottom Corner
      ctx.lineTo(x + w - tailXOffset, y + h);
      // Right Inner Corner
      ctx.lineTo(x + w - tailXOffset, y + headHeight);
      // Right Wing
      ctx.lineTo(x + w, y + headHeight);
    } else if (shape.type === 'arrowDown') {
      const headHeight = Math.min(h * 0.5, w);
      const tailWidth = w * 0.5;
      const tailXOffset = (w - tailWidth) / 2;
      // Tip (Bottom Center)
      ctx.moveTo(x + w / 2, y + h);
      // Left Wing
      ctx.lineTo(x, y + h - headHeight);
      // Left Inner Corner
      ctx.lineTo(x + tailXOffset, y + h - headHeight);
      // Left Top Corner
      ctx.lineTo(x + tailXOffset, y);
      // Right Top Corner
      ctx.lineTo(x + w - tailXOffset, y);
      // Right Inner Corner
      ctx.lineTo(x + w - tailXOffset, y + h - headHeight);
      // Right Wing
      ctx.lineTo(x + w, y + h - headHeight);
    }
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (shape.type === 'triangle') {
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height);
    ctx.closePath();
    ctx.stroke();
  } else if (shape.type === 'hexagon') {
    const a = 2 * Math.PI / 6;
    const r = shape.radius!;

    for (let i = 0; i < 6; i++) {
      ctx.lineTo(shape.centerX! + r * Math.cos(a * i), shape.centerY! + r * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.stroke();
  } else if (shape.type === 'rhombus') {
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y);
    ctx.lineTo(shape.x + shape.width + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.closePath();
    ctx.stroke();
    // ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === 'star') {
    let rot = Math.PI / 2 * 3;
    let x = shape.centerX!;
    let y = shape.centerY!;
    const step = Math.PI / 5;

    ctx.beginPath();
    ctx.moveTo(shape.centerX!, shape.centerY! - shape.outerRadius!);
    for (let i = 0; i < 5; i++) {
      x = shape.centerX! + Math.cos(rot) * shape.outerRadius!;
      y = shape.centerY! + Math.sin(rot) * shape.outerRadius!;
      ctx.lineTo(x, y);
      rot += step;

      x = shape.centerX! + Math.cos(rot) * shape.innerRadius!;
      y = shape.centerY! + Math.sin(rot) * shape.innerRadius!;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(shape.centerX!, shape.centerY! - shape.outerRadius!);
    ctx.closePath();
    ctx.stroke();
  } else if (shape.type === 'heart') {
    let topCurveHeight = shape.height * 0.3;
    ctx.moveTo(shape.x, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x, shape.y, shape.x - shape.width / 2, shape.y, shape.x - shape.width / 2, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x - shape.width / 2, shape.y + (shape.height + topCurveHeight) / 2, shape.x, shape.y + (shape.height + topCurveHeight) / 2, shape.x, shape.y + shape.height);
    ctx.bezierCurveTo(shape.x, shape.y + (shape.height + topCurveHeight) / 2, shape.x + shape.width / 2, shape.y + (shape.height + topCurveHeight) / 2, shape.x + shape.width / 2, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x + shape.width / 2, shape.y, shape.x, shape.y, shape.x, shape.y + topCurveHeight);
    ctx.closePath();
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
    const { activeTool } = useToolStore.getState();
    const selectedIcon = iconLibrary.find(icon => icon.name === activeTool);
    const shapeType = selectedIcon?.shapeType;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "rgba(0, 0, 0)";
    ctx.lineWidth = 2 / scale;
    shapes.forEach((shape) => drawShape(ctx, shape));
    ctx.restore();
    if (tailPoints.length > 0) {
      drawTail(ctx, tailPoints, offsetX, offsetY, scale, shapeType!)
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
    if (shapeType === 'pencil' || shapeType === 'highlight') {
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
        } else if (hit.type === 'circle' || hit.type === 'hexagon' || hit.type === 'star') {
          dragOffset = { x: startX - hit.centerX!, y: startY - hit.centerY! }
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
          // small buffer to prevent sub-pixel rendering difference from triggering an immediate line wrap.
          const safeWidth = (input.scrollWidth / scale) + 20;
          const newShape: Shape = {
            type: shapeType,
            id,
            x: noteX,
            y: noteY,
            width: safeWidth,
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
      input.style.fontFamily = `${knewave.style.fontFamily}`;
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

    if (shapeType === 'hand') {
      canvas.style.cursor = 'grab';
      render();
      return;
    }

    if (shapeType === 'eraser' || shapeType === 'laser') {
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
    } else if (shapeType === 'rectangle' || shapeType === 'diamond' || shapeType === 'rhombus' || shapeType === 'triangle' || shapeType === 'heart' || shapeType === 'arrowLeft' || shapeType === 'arrowRight' || shapeType === 'arrowUp' || shapeType === 'arrowDown') {
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
    } else if (shapeType === 'arrow') {
      newShape = {
        type: shapeType,
        x: startX,
        y: startY,
        width: currentX,
        height: currentY
      }
    } else if (shapeType === 'pencil' || shapeType === 'highlight') {
      newShape = {
        type: shapeType,
        points: [...currentPencilPoints],
      }
      currentPencilPoints = [];
    } else if (shapeType === 'hexagon') {
      const radius = Math.hypot(width, height)
      newShape = {
        type: shapeType,
        radius,
        centerX: startX,
        centerY: startY
      }
    } else if (shapeType === 'star') {
      const outerRadius = Math.hypot(width, height);
      const innerRadius = outerRadius / 2;
      newShape = {
        type: shapeType,
        centerX: startX,
        centerY: startY,
        innerRadius,
        outerRadius
      }
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
          } else if (target.type === 'circle' || target.type === 'hexagon' || target.type === 'star') {
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

    if (shapeType === "eraser" || shapeType === 'laser') {
      tailPoints.push({ x: currentX, y: currentY })
      if (tailPoints.length > tailLength) {
        tailPoints.shift();
      }
      if (shapeType === 'eraser') {
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
      }
      drawTail(ctx, tailPoints, offsetX, offsetY, scale, shapeType);
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
    } else if (shapeType === 'diamond' || shapeType === 'rectangle' || shapeType === 'rhombus' || shapeType === 'triangle' || shapeType === 'heart' || shapeType === 'arrowLeft' || shapeType === 'arrowRight' || shapeType === 'arrowUp' || shapeType === 'arrowDown') {
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
    } else if (shapeType === 'pencil' || shapeType === 'highlight') {
      currentPencilPoints.push({ x: currentX, y: currentY })
      drawShape(ctx, {
        type: shapeType,
        points: currentPencilPoints
      })
    } else if (shapeType === 'arrow') {
      drawShape(ctx, {
        type: shapeType,
        x: startX,
        y: startY,
        width: currentX,
        height: currentY
      })
    } else if (shapeType === 'hexagon') {
      const radius = Math.hypot(width, height);
      drawShape(ctx, {
        type: shapeType,
        centerX: startX,
        centerY: startY,
        radius,
      })
    } else if (shapeType === 'star') {
      const outerRadius = Math.hypot(width, height);
      const innerRadius = outerRadius / 2;
      drawShape(ctx, {
        type: shapeType,
        centerX: startX,
        centerY: startY,
        innerRadius,
        outerRadius,
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
  if (shape.type === 'rectangle' || shape.type === 'image' || shape.type === 'note' || shape.type === 'triangle' || shape.type === 'rhombus' || shape.type === 'arrowLeft' || shape.type === 'arrowRight' || shape.type === 'arrowUp' || shape.type === 'arrowDown') {
    const width = shape.width || 0;
    const height = shape.height || 0;
    let left = Math.min(shape.x, shape.x + width)
    let right = Math.max(shape.x, shape.x + width)
    let top = Math.min(shape.y, shape.y + height)
    let bottom = Math.max(shape.y, shape.y + height)
    return x >= left && x <= right && y >= top && y <= bottom;
  }
  if (shape.type === 'heart') {
    const left = shape.x - shape.width / 2;
    const right = shape.x + shape.width / 2;
    const top = shape.y;
    const bottom = shape.y + shape.height;
    return x >= left && x <= right && y >= top && y <= bottom;
  }
  if (shape.type === 'diamond') {
    const centerX = shape.x + shape.width / 2
    const centerY = shape.y + shape.height / 2
    const dx = Math.abs(x - centerX) / (shape.width / 2);
    const dy = Math.abs(y - centerY) / (shape.height / 2);
    return (dx + dy) <= 1;
  }
  if (shape.type === 'circle' || shape.type === 'hexagon' || shape.type === 'star') {
    const distance = Math.hypot(x - shape.centerX!, y - shape.centerY!);
    if (shape.type === 'star') {
      return distance <= shape.outerRadius!;
    }
    return distance <= shape.radius!;
  }

  if (shape.type === 'pencil' || shape.type === 'highlight') {
    return shape.points?.some((p, i) => {
      if (i == 0) return false;
      const prev = shape.points[i - 1];
      return distToSegment({ x, y }, prev!, p) < threshold;
    })
  }
  if (shape.type === 'line') {
    return distToSegment({ x, y }, { x: shape.x, y: shape.y }, { x: shape.width, y: shape.height }) < threshold
  }
  if (shape.type === 'arrow') {
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

const drawTail = (ctx: CanvasRenderingContext2D, tailPoints: { x: number, y: number }[], offsetX: number, offsetY: number, scale: number, toolType: string) => {
  if (tailPoints.length < 2) return;
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(tailPoints[0]!.x, tailPoints[0]!.y);

  for (let i = 1; i < tailPoints.length - 1; i++) {
    const p1 = tailPoints[i];
    const p2 = tailPoints[i + 1];
    const midX = (p1!.x + p2!.x) / 2;
    const midY = (p1!.y + p2!.y) / 2;
    ctx.quadraticCurveTo(p1!.x, p1!.y, midX, midY);
  }
  const lastPoint = tailPoints[tailPoints.length - 1];
  if (lastPoint) ctx.lineTo(lastPoint.x, lastPoint.y);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (toolType === 'laser') {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 5 / scale;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
    ctx.stroke();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1 / scale;
  } else {
    ctx.strokeStyle = "rgba(180, 180, 180, 0.5)";
    ctx.lineWidth = 10 / scale;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(245, 245, 245, 0.7)";
  }
  ctx.stroke();
  ctx.restore();
}