import z from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-z0-9]+$/, {
      message: "Username can only contain lowercase letters and numbers",
    }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(4).max(20)
})
export const FetchRoomInfo = z.object({
  slug: z.string().min(4).max(20)
})

export const FetchMessages = z.object({
  roomId: z.coerce.string()
})

export type Shape = | {
  id: string,
  type: "rectangle" | "diamond" | "rhombus" | "triangle" | "heart" | "line" | "laser" | "select" | "arrow" | "arrowLeft" | "arrowRight" | "arrowUp" | "arrowDown";
  x: number;
  y: number;
  width: number;
  height: number;
  isDeleted?: boolean;
} |
{
  id: string,
  type: 'circle' | 'hexagon' | 'star';
  centerX?: number;
  centerY?: number;
  radius?: number;
  innerRadius?: number;
  outerRadius?: number;
  isDeleted?: boolean;
} |
{
  id: string,
  type: 'pencil' | 'eraser' | 'highlight'
  points: {
    x: number;
    y: number
  }[]
  isDeleted?: boolean
} |
{
  id: string,
  type: "text" | "note" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string; // For text/notes
  fontSize?: number;
  imgUrl?: string;     // For images
  isDeleted?: boolean
}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type DraftShape = DistributiveOmit<Shape, 'id'>;

export type WSMessage = { roomId: string } & (
  | { type: 'join_room' }
  | { type: 'chat', message: string }
)

export type IncomingWsData = WSMessage | { type: "error"; message: string };

export type DrawActions = {
  cleanup: () => void;
  handleAddRemoteShape: (s: Shape) => void;
}