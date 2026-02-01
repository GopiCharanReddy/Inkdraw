import { DraftShape } from "@repo/schema";

export const renderRectangle = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'rectangle') {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
  }
};

export const renderDiamond = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'diamond') {
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height / 2);
    ctx.closePath();
    ctx.stroke();
  }
};

export const renderCircle = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'circle') {
    ctx.arc(shape.centerX!, shape.centerY!, shape.radius!, 0, 2 * Math.PI)
    ctx.stroke()
  }
};

export const renderTriangle = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'triangle') {
    ctx.moveTo(shape.x + shape.width / 2, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
    ctx.lineTo(shape.x, shape.y + shape.height);
    ctx.closePath();
    ctx.stroke();
  }
};

export const renderRhombus = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'rhombus') {
    ctx.moveTo(shape.x, shape.y);
    ctx.lineTo(shape.x + shape.width, shape.y);
    ctx.lineTo(shape.x + shape.width + shape.width / 2, shape.y + shape.height);
    ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
    ctx.closePath();
    ctx.stroke();
  }
};

export const renderStar = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'star') {
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
  }
};

export const renderHexagon = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'hexagon') {
    const a = 2 * Math.PI / 6;
    const r = shape.radius!;

    for (let i = 0; i < 6; i++) {
      ctx.lineTo(shape.centerX! + r * Math.cos(a * i), shape.centerY! + r * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.stroke();
  }
};

export const renderHeart = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'heart') {
    let topCurveHeight = shape.height * 0.3;
    ctx.moveTo(shape.x, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x, shape.y, shape.x - shape.width / 2, shape.y, shape.x - shape.width / 2, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x - shape.width / 2, shape.y + (shape.height + topCurveHeight) / 2, shape.x, shape.y + (shape.height + topCurveHeight) / 2, shape.x, shape.y + shape.height);
    ctx.bezierCurveTo(shape.x, shape.y + (shape.height + topCurveHeight) / 2, shape.x + shape.width / 2, shape.y + (shape.height + topCurveHeight) / 2, shape.x + shape.width / 2, shape.y + topCurveHeight);
    ctx.bezierCurveTo(shape.x + shape.width / 2, shape.y, shape.x, shape.y, shape.x, shape.y + topCurveHeight);
    ctx.closePath();
    ctx.stroke();
  }
};

export const renderArrow = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'arrow') {
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
  }
}

export const renderArrowDirection = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'arrowLeft' || shape.type === 'arrowRight' || shape.type === 'arrowUp' || shape.type === 'arrowDown') {
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
  }
}