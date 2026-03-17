import { StackHandler } from "@stackauth/nextjs";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: unknown) {
  return <StackHandler app={stackServerApp} {...(props as object)} />;
}
