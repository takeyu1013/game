import { runFork, sync } from "effect/Effect";
import { interrupt } from "effect/Fiber";
import { match } from "effect/Option";
import { decodeUnknownOption, instanceOf, Literals } from "effect/Schema";
import { type EventListener, fromEventListener, mergeAll, runForEach } from "effect/Stream";

const SIDES = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
} as const;

const KeyCode = Literals(["ArrowLeft", "KeyA", "ArrowRight", "KeyD"]);

const windowEvents = (): EventListener<Event> => ({
  addEventListener: (type, listener, options) => {
    window.addEventListener(type, listener, options);
  },
  removeEventListener: (type, listener, options) => {
    window.removeEventListener(type, listener, options);
  },
});

const listen = (type: string) => fromEventListener(windowEvents(), type);

export const bindPlayerInput = (setInput: (held: { left: boolean; right: boolean }) => unknown) => {
  let held = { left: false, right: false };
  const fiber = runFork(
    runForEach(
      mergeAll([listen("keydown"), listen("keyup"), listen("blur")], { concurrency: "unbounded" }),
      (event) =>
        sync(() => {
          if (event.type === "blur") {
            held = { left: false, right: false };
            void setInput({ ...held });
            return;
          }
          match(decodeUnknownOption(instanceOf(KeyboardEvent))(event), {
            onNone: () => undefined,
            onSome: (key) => {
              match(decodeUnknownOption(KeyCode)(key.code), {
                onNone: () => undefined,
                onSome: (code) => {
                  if (key.repeat) {
                    return;
                  }
                  key.preventDefault();
                  held = { ...held, [SIDES[code]]: key.type === "keydown" };
                  void setInput({ ...held });
                },
              });
            },
          });
        }),
    ),
  );
  return () => {
    runFork(interrupt(fiber));
  };
};
