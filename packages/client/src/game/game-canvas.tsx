import { useEffect, useRef } from "react";
import { startGame, type WorldHandle } from "./world-scene.ts";

export const GameCanvas = ({ world }: { readonly world: WorldHandle }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }
    const game = startGame(parent, world);
    return () => {
      game.destroy(true);
    };
  }, [world]);

  return <div ref={parentRef} className="game" />;
};
