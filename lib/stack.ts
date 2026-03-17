import { StackServerApp } from "@stackauth/nextjs";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    afterSignIn: "/analise",
    afterSignOut: "/",
  },
});
