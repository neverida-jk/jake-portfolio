"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// Shared cross-highlight state for the Toolkit <-> Work sections (§6.4).
// Hovering a tool chip focuses it (and dims everything else); hovering a
// project card does the same for that project. Debounced per spec: 60ms to
// register a hover, 120ms to clear it, so a quick mouse pass between
// adjacent chips doesn't strobe the dim/undim transition.
type ToolFocusContextValue = {
  focusedTool: string | null;
  focusedProject: string | null;
  setFocusedTool: (id: string | null) => void;
  setFocusedProject: (id: string | null) => void;
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
  const [focusedProject, setFocusedProject] = useDebouncedSetter();

  const value = useMemo(
    () => ({ focusedTool, focusedProject, setFocusedTool, setFocusedProject }),
    [focusedTool, focusedProject, setFocusedTool, setFocusedProject]
  );

  return <ToolFocusContext.Provider value={value}>{children}</ToolFocusContext.Provider>;
}

export function useToolFocus() {
  const ctx = useContext(ToolFocusContext);
  if (!ctx) throw new Error("useToolFocus must be used within a ToolFocusProvider");
  return ctx;
}
