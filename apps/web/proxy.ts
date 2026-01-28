import { NextRequest, NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {

  const sessionToken = request.cookies.get('better-auth.session_token');

  const isAuthenticated = !!sessionToken;

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/signup', request.url));
  } else {
    const randomRoomId = crypto.randomUUID();
    return NextResponse.redirect(new URL(`/canvas/${randomRoomId}`, request.url));
  }
}

export const config = {
  matcher: '/',
}