import z, { number } from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long" })
    .max(20, { error: "Username cannot exceed 20 characters" })
    .regex(/^[a-z0-9]+$/, {
      error: "Username can only contain lowercase letters and numbers",
    }),
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      error: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number" }),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(4).max(20)
})
export const FetchRoomInfo = z.object({
  slug: z.string().min(4).max(20)
})

export const FetchMessages = z.object({
  roomId: z.coerce.number()
})


export type Shape = | {
  type: "rect" | "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
} |
{
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
}

export type WSMessage = { roomId: string } & (
  | { type: 'join_room' }
  | { type: 'chat', message: string }
)

export type IncomingWsData = WSMessage | { type: "error"; message: string };

export type DrawActions = {
  cleanup: () => void;
  handleAddRemoteShape: (s: Shape) => void;
}