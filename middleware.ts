import { stackServerApp } from "@/lib/stack";

export const middleware = stackServerApp.middleware;

export const config = {
  matcher: ["/handler/:path*", "/analise/:path*"],
};
