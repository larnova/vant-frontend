"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "vant-demo-mode";

export const DEMO_BUSINESS_SLUG = "vant-demo-business";
export const DEMO_BUSINESS_NAME = "Vant Demo Business";

type DemoModeContextValue = {
  isDemoMode: boolean;
  setDemoMode: (on: boolean) => void;
  enterDemo: () => void;
  exitDemo: () => void;
};

function readDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setState] = useState(false);

  useEffect(() => {
    setState(readDemoMode());
  }, []);

  const setDemoMode = useCallback((on: boolean) => {
    if (typeof window === "undefined") return;
    try {
      if (on) sessionStorage.setItem(STORAGE_KEY, "1");
      else sessionStorage.removeItem(STORAGE_KEY);
      setState(on);
    } catch {}
  }, []);

  const enterDemo = useCallback(() => setDemoMode(true), [setDemoMode]);
  const exitDemo = useCallback(() => setDemoMode(false), [setDemoMode]);

  const value = useMemo<DemoModeContextValue>(
    () => ({ isDemoMode, setDemoMode, enterDemo, exitDemo }),
    [isDemoMode, setDemoMode, enterDemo, exitDemo]
  );

  return (
    <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    return {
      isDemoMode: false,
      setDemoMode: () => {},
      enterDemo: () => {},
      exitDemo: () => {},
    };
  }
  return ctx;
}

export function isDemoModeActive(): boolean {
  if (typeof window === "undefined") return false;
  return readDemoMode();
}
