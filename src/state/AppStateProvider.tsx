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

type WorkspaceGetResponse =
  | { enabled: false }
  | { enabled: true; state: AppState | null };

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Keep initial server/client render identical, then hydrate from shared workspace or localStorage.
  const [state, dispatch] = useReducer(appReducer, undefined, () => seedState());
  const didHydrateRef = useRef(false);
  const syncEnabledRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspace", { cache: "no-store" });
        const data = (await res.json()) as WorkspaceGetResponse;
        if (cancelled) return;

        if (!data.enabled) {
          syncEnabledRef.current = false;
          const loaded = loadState();
          if (loaded) dispatch({ type: "state.import", state: loaded });
        } else {
          syncEnabledRef.current = true;
          if (data.state) dispatch({ type: "state.import", state: data.state });
        }
      } catch {
        if (!cancelled) {
          syncEnabledRef.current = false;
          const loaded = loadState();
          if (loaded) dispatch({ type: "state.import", state: loaded });
        }
      } finally {
        if (!cancelled) didHydrateRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    saveState(state);

    if (!syncEnabledRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
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

