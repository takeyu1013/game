import { useEffect, useRef } from "react";
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

  useEffect(() => {
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
    const onDown = (event: KeyboardEvent) => onKey(event, true);
    const onUp = (event: KeyboardEvent) => onKey(event, false);
    const onBlur = () => {
      if (held.current.left || held.current.right) {
        send(released);
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      onBlur();
    };
  }, [setInput]);
};
