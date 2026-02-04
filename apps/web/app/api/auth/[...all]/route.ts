import { getAuth } from "@repo/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

const handler = () => {
  const auth = getAuth();
  return toNextJsHandler(auth);
};

export const GET = async (...args: Parameters<ReturnType<typeof handler>["GET"]>) => {
  const { GET } = handler();
  return GET(...args);
};

export const POST = async (...args: Parameters<ReturnType<typeof handler>["POST"]>) => {
  const { POST } = handler();
  return POST(...args);
};
