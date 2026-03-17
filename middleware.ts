import { stackServerApp } from "@/lib/stack";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await stackServerApp.handler(request);
}

export const config = {
  matcher: ["/handler/:path*", "/analise/:path*"],
};
