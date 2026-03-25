"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
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
  // Keep initial server/client render identical, then hydrate from localStorage after mount.
  const [state, dispatch] = useReducer(appReducer, undefined, () => seedState());
  const didHydrateRef = useRef(false);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) dispatch({ type: "state.import", state: loaded });
    didHydrateRef.current = true;
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
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

