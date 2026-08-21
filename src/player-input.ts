import { fn, runFork, sync } from "effect/Effect";
import { interrupt } from "effect/Fiber";
import { fromPredicateOption } from "effect/Filter";
import { exhaustive, value, when } from "effect/Match";
import { filter, flatMap, map } from "effect/Option";
import { type Ref, make, updateAndGet } from "effect/Ref";
import { decodeUnknownOption, instanceOf, Literals } from "effect/Schema";
import {
  type EventListener,
  filterMap,
  fromEventListener,
  map as mapStream,
  mergeAll,
  runForEach,
} from "effect/Stream";

const SIDES = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
} as const;

const KeyCode = Literals(["ArrowLeft", "KeyA", "ArrowRight", "KeyD"]);

type Held = {
  readonly left: boolean;
  readonly right: boolean;
};

type KeyMessage = {
  readonly kind: "key";
  readonly code: keyof typeof SIDES;
  readonly down: boolean;
  readonly event: KeyboardEvent;
};

type InputMessage = KeyMessage | { readonly kind: "blur" };

const windowEvents = (): EventListener<Event> => ({
  addEventListener: (type, listener, options) => {
    window.addEventListener(type, listener, options);
  },
  removeEventListener: (type, listener, options) => {
    window.removeEventListener(type, listener, options);
  },
});

const listen = (type: string) => fromEventListener(windowEvents(), type);

const asKeyMessage = fromPredicateOption((event: Event) =>
  flatMap(
    filter(decodeUnknownOption(instanceOf(KeyboardEvent))(event), (key) => !key.repeat),
    (key) =>
      map(decodeUnknownOption(KeyCode)(key.code), (code) => ({
        kind: "key" as const,
        code,
        down: key.type === "keydown",
        event: key,
      })),
  ),
);

const applyMessage = (held: Held, message: InputMessage): Held =>
  value(message).pipe(
    when({ kind: "blur" }, () => ({ left: false, right: false })),
    when({ kind: "key" }, (key) => ({ ...held, [SIDES[key.code]]: key.down })),
    exhaustive,
  );

const handleInput = fn("handleInput")(function* (
  held: Ref<Held>,
  setInput: (state: Held) => unknown,
  message: InputMessage,
) {
  const next = yield* updateAndGet(held, (current) => applyMessage(current, message));
  yield* sync(() => {
    if (message.kind === "key") {
      message.event.preventDefault();
    }
    setInput(next);
  });
});

const listenPlayerInput = fn("listenPlayerInput")(function* (setInput: (state: Held) => unknown) {
  const held = yield* make<Held>({ left: false, right: false });
  yield* runForEach(
    mergeAll(
      [
        filterMap(listen("keydown"), asKeyMessage),
        filterMap(listen("keyup"), asKeyMessage),
        mapStream(listen("blur"), (): InputMessage => ({ kind: "blur" })),
      ],
      { concurrency: "unbounded" },
    ),
    (message) => handleInput(held, setInput, message),
  );
});

export const bindPlayerInput = (setInput: (held: Held) => unknown) => {
  const fiber = runFork(listenPlayerInput(setInput));
  return () => {
    runFork(interrupt(fiber));
  };
};
