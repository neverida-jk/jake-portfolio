"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// Shared focus state for the Toolkit's tool chips (§6.4): hovering a chip
// lights it and dims its siblings, and the command palette's "jump to a
// tool" flashes the same state after scrolling there. Debounced per spec:
// 60ms to register a hover, 120ms to clear it, so a quick mouse pass
// between adjacent chips doesn't strobe the dim/undim transition.
//
// This used to also drive a cross-section highlight into the Work section
// (hovering a chip dimmed/lit project cards, and vice versa) — removed
// because the two sections are never visible together, so the effect was
// invisible when it fired and confusing when it lingered.
type ToolFocusContextValue = {
  focusedTool: string | null;
  setFocusedTool: (id: string | null) => void;
};

const ENTER_DELAY = 60;
const LEAVE_DELAY = 120;

const ToolFocusContext = createContext<ToolFocusContextValue | null>(null);

function useDebouncedSetter(): [string | null, (id: string | null) => void] {
  const [value, setValue] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((id: string | null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = id === null ? LEAVE_DELAY : ENTER_DELAY;
    timeoutRef.current = setTimeout(() => setValue(id), delay);
  }, []);

  return [value, set];
}

export function ToolFocusProvider({ children }: { children: React.ReactNode }) {
  const [focusedTool, setFocusedTool] = useDebouncedSetter();

  const value = useMemo(() => ({ focusedTool, setFocusedTool }), [focusedTool, setFocusedTool]);

  return <ToolFocusContext.Provider value={value}>{children}</ToolFocusContext.Provider>;
}

export function useToolFocus() {
  const ctx = useContext(ToolFocusContext);
  if (!ctx) throw new Error("useToolFocus must be used within a ToolFocusProvider");
  return ctx;
}
