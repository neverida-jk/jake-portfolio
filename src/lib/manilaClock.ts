// Manila is UTC+8 all year (no DST), so the time of day is plain arithmetic
// on the epoch — no Intl formatting per frame.
const DAY = 86_400_000;
const MANILA_OFFSET = 8 * 3_600_000;

export type HandAngles = { hour: number; minute: number; second: number };

/** Hand angles in degrees clockwise from 12 o'clock. Second hand sweeps. */
export function manilaAngles(epochMs: number = Date.now()): HandAngles {
  const ms = (((epochMs + MANILA_OFFSET) % DAY) + DAY) % DAY;
  return {
    hour: (ms % 43_200_000) / 43_200_000 * 360,
    minute: (ms % 3_600_000) / 3_600_000 * 360,
    second: (ms % 60_000) / 60_000 * 360,
  };
}

/** "10:43 AM" in Manila. */
export function manilaClockText(epochMs: number = Date.now()): string {
  const ms = (((epochMs + MANILA_OFFSET) % DAY) + DAY) % DAY;
  const h24 = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}
