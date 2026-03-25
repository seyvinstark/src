import type { AppState, RuleSettings } from "@/state/types";

function isRuleSettings(v: unknown): v is RuleSettings {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.enforceFreeSlotPerDay === "boolean" &&
    typeof r.enforceFridayShortDay === "boolean"
  );
}

export function parseAppState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.teachers)) return null;
  if (!Array.isArray(o.grades)) return null;
  if (!Array.isArray(o.subjects)) return null;
  if (!Array.isArray(o.mappings)) return null;
  if (!Array.isArray(o.timeSlots)) return null;
  if (!Array.isArray(o.entries)) return null;
  if (!isRuleSettings(o.rules)) return null;
  return raw as AppState;
}
