import { DraftShape } from "@repo/schema";
import { renderArrow, renderArrowDirection, renderCircle, renderDiamond, renderHeart, renderHexagon, renderRectangle, renderRhombus, renderStar, renderTriangle } from "./basic";
import { renderLine, renderPath } from "./path";
import { renderNote, renderText } from "./text";
import { renderImage } from "./media";

type RenderFn = (ctx: CanvasRenderingContext2D, shape: DraftShape) => void;

const renderers: Record<string, RenderFn> = {
  rectangle: renderRectangle,
  diamond: renderDiamond,
  circle: renderCircle,
  line: renderLine,
  pencil: renderPath,
  triangle: renderTriangle,
  highlight: renderPath,
  text: renderText,
  image: renderImage,
  note: renderNote,
  arrow: renderArrow,
  arrowLeft: renderArrowDirection,
  arrowRight: renderArrowDirection,
  arrowUp: renderArrowDirection,
  arrowDown: renderArrowDirection,
  hexagon: renderHexagon,
  star: renderStar,
  heart: renderHeart,
  rhombus: renderRhombus,
}

export const renderShapeToCanvas = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  ctx.beginPath();
  const renderer = renderers[shape.type];
  if (renderer) {
    renderer(ctx, shape);
  } else {
    console.warn(`No renderer found for shape type: ${shape.type}`);
  }
}