import { useRef } from "react";
import { useReducer } from "spacetimedb/react";
import { useEventListener, useUnmount } from "usehooks-ts";
import { reducers } from "./module-bindings";

const KEY_SIDE: Record<string, "left" | "right"> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

type Held = { left: boolean; right: boolean };

const nextHeld = (held: Held, code: string, pressed: boolean, repeat: boolean) => {
  const side = KEY_SIDE[code];
  if (side === undefined || repeat || held[side] === pressed) {
    return null;
  }
  return { ...held, [side]: pressed };
};

const released = { left: false, right: false };

export const usePlayerInput = () => {
  const setInput = useReducer(reducers.setInput);
  const held = useRef(released);

  const send = (next: Held) => {
    held.current = next;
    void setInput(next);
  };

  const onKey = (event: KeyboardEvent, pressed: boolean) => {
    if (KEY_SIDE[event.code] !== undefined) {
      event.preventDefault();
    }
    const next = nextHeld(held.current, event.code, pressed, event.repeat);
    if (next !== null) {
      send(next);
    }
  };

  const release = () => {
    if (held.current.left || held.current.right) {
      send(released);
    }
  };

  useEventListener("keydown", (event) => onKey(event, true));
  useEventListener("keyup", (event) => onKey(event, false));
  useEventListener("blur", release);
  useUnmount(release);
};
