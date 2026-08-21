import { useRef, type KeyboardEvent } from "react";
import { useReducer } from "spacetimedb/react";
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
  const root = useRef<HTMLDivElement>(null);

  const send = (next: Held) => {
    held.current = next;
    void setInput(next);
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>, pressed: boolean) => {
    if (KEY_SIDE[event.code] !== undefined) {
      event.preventDefault();
    }
    const next = nextHeld(held.current, event.code, pressed, event.repeat);
    if (next !== null) {
      send(next);
    }
  };

  return {
    ref: root,
    tabIndex: 0,
    autoFocus: true,
    onClick: () => root.current?.focus(),
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => onKey(event, true),
    onKeyUp: (event: KeyboardEvent<HTMLDivElement>) => onKey(event, false),
    onBlur: () => {
      if (held.current.left || held.current.right) {
        send(released);
      }
    },
  };
};
