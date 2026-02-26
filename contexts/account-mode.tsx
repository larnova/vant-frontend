"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "vant-account-mode";

export type AccountMode = "user" | "merchant";

export type MerchantBusiness = {
  slug: string;
  businessName: string;
};

type Stored = {
  mode: AccountMode;
  currentBusiness: MerchantBusiness | null;
};

type AccountModeContextValue = {
  mode: AccountMode;
  currentBusiness: MerchantBusiness | null;
  switchToUser: () => void;
  switchToMerchant: (business: MerchantBusiness) => void;
  isMerchant: boolean;
};

const defaultState: Stored = {
  mode: "user",
  currentBusiness: null,
};

function loadStored(): Stored {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Stored;
    return {
      mode: parsed.mode === "merchant" ? "merchant" : "user",
      currentBusiness:
        parsed.currentBusiness?.slug && parsed.currentBusiness?.businessName
          ? parsed.currentBusiness
          : null,
    };
  } catch {
    return defaultState;
  }
}

function saveStored(state: Stored) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const AccountModeContext = createContext<AccountModeContextValue | null>(null);

export function AccountModeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(defaultState);

  useEffect(() => {
    setState(loadStored());
  }, []);

  const persist = useCallback((next: Stored) => {
    setState(next);
    saveStored(next);
  }, []);

  const switchToUser = useCallback(() => {
    persist({ mode: "user", currentBusiness: null });
  }, [persist]);

  const switchToMerchant = useCallback(
    (business: MerchantBusiness) => {
      persist({ mode: "merchant", currentBusiness: business });
    },
    [persist]
  );

  const value = useMemo<AccountModeContextValue>(
    () => ({
      mode: state.mode,
      currentBusiness: state.currentBusiness,
      switchToUser,
      switchToMerchant,
      isMerchant: state.mode === "merchant",
    }),
    [state.mode, state.currentBusiness, switchToUser, switchToMerchant]
  );

  return (
    <AccountModeContext.Provider value={value}>
      {children}
    </AccountModeContext.Provider>
  );
}

export function useAccountMode(): AccountModeContextValue {
  const ctx = useContext(AccountModeContext);
  if (!ctx) {
    return {
      mode: "user",
      currentBusiness: null,
      switchToUser: () => {},
      switchToMerchant: () => {},
      isMerchant: false,
    };
  }
  return ctx;
}
