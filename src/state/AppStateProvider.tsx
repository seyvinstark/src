"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { AppState, AppAction } from "@/state/types";
import { appReducer } from "@/state/reducer";
import { loadState, saveState } from "@/state/storage";
import { seedState } from "@/state/seed";

type AppStateContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    const loaded = loadState();
    return loaded ?? seedState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

