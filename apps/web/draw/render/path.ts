import { DraftShape } from "@repo/schema";

export const renderLine = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'line') {
    ctx.moveTo(shape.x, shape.y)
    ctx.lineTo(shape.width, shape.height) // here width/height are currentX/currentY i.e., endX/endY
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

export const renderPath = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'pencil' || shape.type === 'highlight') {
    if (shape.type === 'pencil') {
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
    }
    if (shape.type === 'highlight') {
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 20;
      ctx.strokeStyle = "#FFFF33";
    }
    if (!shape.points || shape.points.length < 2) return;
    ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y)
    }
    ctx.lineCap = "round"
    ctx.lineJoin = "miter"
    ctx.stroke();
  }
};