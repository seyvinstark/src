import type { AppState as State, Entry as StateEntry, Day as StateDay, Id } from "@/state/types";

export type AppState = State;
export type Entry = StateEntry;
export type Day = StateDay;

export type ValidationReason =
  | { code: "slot.not_found" }
  | { code: "slot.locked"; slotType: "break" | "lunch" | "locked" }
  | { code: "teacher.double_booked"; teacherId: Id; day: Day; slotId: Id }
  | { code: "mapping.missing" }
  | { code: "mapping.periods_exceeded"; mappingId: Id; assigned: number; required: number }
  | { code: "teacher.hours_exceeded"; teacherId: Id; assignedHours: number; maxWeeklyHours: number };

