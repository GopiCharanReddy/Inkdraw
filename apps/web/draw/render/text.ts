import { DraftShape } from "@repo/schema";
import { knewave } from "@/app/layout";

export const renderText = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'text') {
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
  }
};

export const renderNote = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'note') {
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
};