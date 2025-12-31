import { Shape } from '@repo/schema';
import { create } from 'zustand'

type ToolState = {
  activeTool: string,
  setSelectedTool: (toolName: string) => void;
}
type CameraState = {
  offsetX: number,
  offsetY: number,
  scale: number
  setOffset: (x: number, y: number) => void,
  setScale: (s: number) => void,
  resetView: () => void,
}

type ShapeState = {
  shapes: Shape[],
  past: Shape[][],
  future: Shape[][],

  setShapes: (shapes: Shape[]) => void,
  addShape: (shape: Shape) => void,
  undo: () => void,
  redo: () => void,
  deleteShape: (id: string) => void
  clearHistory: () => void
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'rectangleIcon',
  setSelectedTool: (toolName) => set({ activeTool: toolName })
}))

export const useCameraStore = create<CameraState>((set) => ({
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  setOffset: (x, y) => set({
    offsetX: x,
    offsetY: y
  }),
  setScale: (s) => set({
    scale: s
  }),
  resetView: () => set({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  })
}))


export const useShapeStore = create<ShapeState>((set) => ({
  shapes: [],
  past: [],
  future: [],
  setShapes: (shapes) => set({ shapes, past: [], future: [] }),
  addShape: (newShape) => set((state) => ({
    past: [...state.past, state.shapes],
    shapes: [...state.shapes, newShape],
    future: [],
  })),
  undo: () => set(state => {
    if (state.past.length === 0) return state;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    return {
      past: newPast,
      shapes: previous,
      future: [state.shapes, ...state.future]
    }
  }),
  redo: () => set(state => {
    if (state.future.length === 0) return state;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    return {
      past: [...state.past, state.shapes],
      shapes: next,
      future: newFuture,
    }
  }),
  deleteShape: (id: string) => set((state) => ({
    past: [...state.past, state.shapes],
    shapes: state.shapes.filter(s => s.id !== id),
    future: []
  })),
  clearHistory: () => set({ past: [], future: [] })
}))