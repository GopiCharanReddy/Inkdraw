import { getAuth } from "@repo/auth/server";
import { toNextJsHandler } from "better-auth/next-js"

const auth = getAuth();
export const { GET, POST } = toNextJsHandler(auth);