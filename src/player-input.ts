import { Effect, Fiber, Stream } from "effect";

const SIDES = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
} as const;

const listen = (type: string) =>
  Stream.fromEventListener(window as Stream.EventListener<Event>, type);

export const bindPlayerInput = (setInput: (held: { left: boolean; right: boolean }) => unknown) => {
  const held = { left: false, right: false };
  const fiber = Effect.runFork(
    Stream.runForEach(
      Stream.mergeAll([listen("keydown"), listen("keyup"), listen("blur")], {
        concurrency: "unbounded",
      }),
      (event) =>
        Effect.sync(() => {
          const key = event as KeyboardEvent;
          const side = SIDES[key.code as keyof typeof SIDES];
          if (event.type === "blur") {
            held.left = false;
            held.right = false;
          } else if (side !== undefined && !key.repeat) {
            key.preventDefault();
            held[side] = key.type === "keydown";
          } else {
            return;
          }
          void setInput({ ...held });
        }),
    ),
  );
  return () => {
    Effect.runFork(Fiber.interrupt(fiber));
  };
};
