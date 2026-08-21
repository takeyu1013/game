import type { KAPLAYCtx } from "kaplay";

const released = { left: false, right: false };

export const bindPlayerInput = (
  k: KAPLAYCtx,
  setInput: (input: { left: boolean; right: boolean }) => unknown,
) => {
  const send = () =>
    void setInput({
      left: k.isButtonDown("left"),
      right: k.isButtonDown("right"),
    });
  k.onButtonPress(["left", "right"], send);
  k.onButtonRelease(["left", "right"], send);
  k.onHide(() => void setInput(released));
  k.canvas.addEventListener("blur", () => void setInput(released));
};
