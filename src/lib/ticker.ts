// One requestAnimationFrame loop for every always-on animation on the site
// (dial hands, background rings, scroll warp). It sleeps when nothing is
// subscribed, and the browser already pauses rAF in hidden tabs.
type Frame = (now: number) => void;

const subs = new Set<Frame>();
let raf = 0;

function loop(now: number) {
  subs.forEach((fn) => fn(now));
  raf = subs.size ? requestAnimationFrame(loop) : 0;
}

export function subscribeFrame(fn: Frame) {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    subs.delete(fn);
    if (!subs.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
