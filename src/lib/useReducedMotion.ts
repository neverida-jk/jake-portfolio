"use client";

import { useEffect, useState } from "react";

// Hydration-safe prefers-reduced-motion. framer-motion's useReducedMotion()
// can return `true` on the client's very first render while the server
// rendered with `false` — any component that branches its markup or styles
// on it (static vs animated) then fails hydration for every reduced-motion
// visitor. This returns false for the server render and the first client
// render, and the real preference right after mount.
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}
