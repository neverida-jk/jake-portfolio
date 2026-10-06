import { subscribeFrame } from "./ticker";

// Scroll speed bends time. The page's clocks add `warp` degrees to their
// hands: scroll fast and the hands spin ahead, stop and a spring pulls them
// back to the real time — with a little overshoot, like a needle settling.
// One shared integrator, started on first use.
const STIFFNESS = 38;
const DAMPING = 7.5;
const GAIN = 0.05; // degrees of warp per px/s of scroll speed
const MAX = 540;

let warp = 0;
let vel = 0;
let lastY = 0;
let lastT = 0;
let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;
  subscribeFrame((now) => {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;
    const y = window.scrollY;
    const speed = (y - lastY) / dt; // px/s, signed
    lastY = y;
    const target = Math.max(-MAX, Math.min(MAX, speed * GAIN));
    // Damped spring toward the target; semi-implicit Euler.
    vel += (STIFFNESS * (target - warp) - DAMPING * vel) * dt;
    warp += vel * dt;
  });
}

/** Current warp in degrees. Cheap; call once per frame from a ticker. */
export function getWarp() {
  start();
  return warp;
}
