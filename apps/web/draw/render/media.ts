import { DraftShape } from "@repo/schema";

const imageCache = new Map<string, HTMLImageElement>();

export const renderImage = (ctx: CanvasRenderingContext2D, shape: DraftShape) => {
  if (shape.type === 'image' && shape.imgUrl) {
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
  }
}