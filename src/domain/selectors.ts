import type { AppState, Day, Entry, Id, TimeSlot } from "@/state/types";

export function getTimeSlotsForDay(state: AppState, day: Day): TimeSlot[] {
  return state.timeSlots.filter((s) => s.day === day);
}

export function getSlot(state: AppState, slotId: Id): TimeSlot | undefined {
  return state.timeSlots.find((s) => s.id === slotId);
}

export function getEntryAt(state: AppState, key: { gradeId: Id; day: Day; slotId: Id }): Entry | undefined {
  return state.entries.find((e) => e.gradeId === key.gradeId && e.day === key.day && e.slotId === key.slotId);
}

export function getTeacherEntryAt(state: AppState, key: { teacherId: Id; day: Day; slotId: Id }): Entry | undefined {
  return state.entries.find((e) => e.teacherId === key.teacherId && e.day === key.day && e.slotId === key.slotId);
}

export function getAssignedPeriodsForMapping(state: AppState, mappingId: Id): number {
  const mapping = state.mappings.find((m) => m.id === mappingId);
  if (!mapping) return 0;
  return state.entries.filter(
    (e) =>
      e.gradeId === mapping.gradeId &&
      e.subjectId === mapping.subjectId &&
      e.teacherId === mapping.teacherId,
  ).length;
}

export function getTeacherAssignedHours(state: AppState, teacherId: Id): number {
  // 1 entry = 1 period/hour for MVP
  return state.entries.filter((e) => e.teacherId === teacherId).length;
}

