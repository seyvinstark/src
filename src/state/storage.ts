import type { AppState } from "@/state/types";

const STORAGE_KEY = "timetable_admin_state_v1";

export function loadState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota/serialization errors for MVP
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

