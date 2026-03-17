import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

export default function Handler(props: unknown) {
  return <StackHandler app={stackServerApp} {...(props as object)} />;
}
