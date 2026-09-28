import React from "react";
import type { Dual as DualValue } from "@/content/copy/types";

interface DualProps {
  value: DualValue;
  /** Element the plain-language text renders as. Ignored when note="only". */
  as?: React.ElementType;
  /** "below" (default): plain text + a technical field note underneath.
   *  "none": plain text only. "only": just the field note, alone. */
  note?: "below" | "none" | "only";
  className?: string;
}

// One person, two audiences, no switch to find: renders both voices at
// once. `plain` reads as ordinary prose in whatever context it's placed;
// `technical` sits beneath it as a small margin annotation — present for
// anyone who looks, invisible in a skim. See owner note superseding the
// old Lens-toggle design (§1.3/§5.2 of the masterplan, pending an update).
const NOTE_CLASSES =
  "block font-mono text-[0.72em] leading-snug tracking-[0.01em] text-ink-3 max-w-[60ch] border-l border-line pl-2.5";

export default function Dual({ value, as: Tag = "p", note = "below", className }: DualProps) {
  if (note === "only") {
    return <span className={`${NOTE_CLASSES} ${className ?? ""}`}>{value.technical}</span>;
  }

  return (
    <>
      <Tag className={className}>{value.plain}</Tag>
      {note === "below" && <span className={`mt-1.5 ${NOTE_CLASSES}`}>{value.technical}</span>}
    </>
  );
}
