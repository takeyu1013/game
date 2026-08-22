import { fn, runFork, sync, tap } from "effect/Effect";
import { interrupt } from "effect/Fiber";
import { fromPredicateOption } from "effect/Filter";
import { filter, flatMap, map } from "effect/Option";
import { make, updateAndGet } from "effect/Ref";
import { decodeUnknownOption, instanceOf, Literals } from "effect/Schema";
import {
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

const listen = (type: string) =>
  fromEventListener<Event>(
    {
      addEventListener: (event, f, options) => {
        window.addEventListener(event, f, options);
      },
      removeEventListener: (event, f, options) => {
        window.removeEventListener(event, f, options);
      },
    },
    type,
  );

const keySide = fromPredicateOption((event: Event) =>
  flatMap(
    filter(decodeUnknownOption(instanceOf(KeyboardEvent))(event), (key) => !key.repeat),
    (key) =>
      map(decodeUnknownOption(KeyCode)(key.code), (code): Partial<Held> => {
        key.preventDefault();
        return { [SIDES[code]]: key.type === "keydown" };
      }),
  ),
);

const listenPlayerInput = fn("listenPlayerInput")(function* (setInput: (held: Held) => unknown) {
  const held = yield* make<Held>({ left: false, right: false });
  yield* runForEach(
    mergeAll(
      [
        filterMap(listen("keydown"), keySide),
        filterMap(listen("keyup"), keySide),
        mapStream(listen("blur"), (): Partial<Held> => ({ left: false, right: false })),
      ],
      { concurrency: "unbounded" },
    ),
    (patch) =>
      tap(
        updateAndGet(held, (current) => ({ ...current, ...patch })),
        (next) => sync(() => setInput(next)),
      ),
  );
});

export const bindPlayerInput = (setInput: (held: Held) => unknown) => {
  const fiber = runFork(listenPlayerInput(setInput));
  return () => {
    runFork(interrupt(fiber));
  };
};
