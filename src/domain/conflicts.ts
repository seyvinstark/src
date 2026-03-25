import type { AppState, Day, Entry, Id } from "@/state/types";
import { getAssignedPeriodsForMapping, getTeacherAssignedHours } from "@/domain/selectors";

export type Conflict =
  | { type: "teacher.double_booked"; teacherId: Id; day: Day; slotId: Id; entries: Entry[] }
  | { type: "mapping.over_allocated"; mappingId: Id; assigned: number; required: number }
  | { type: "teacher.over_hours"; teacherId: Id; assignedHours: number; maxWeeklyHours: number };

export function listConflicts(state: AppState): Conflict[] {
  const conflicts: Conflict[] = [];

  // Teacher double bookings
  for (const teacher of state.teachers) {
    for (const slot of state.timeSlots) {
      const entries = state.entries.filter(
        (e) => e.teacherId === teacher.id && e.day === slot.day && e.slotId === slot.id,
      );
      if (entries.length > 1) {
        conflicts.push({
          type: "teacher.double_booked",
          teacherId: teacher.id,
          day: slot.day,
          slotId: slot.id,
          entries,
        });
      }
    }
  }

  // Mapping over-allocation
  for (const mapping of state.mappings) {
    const assigned = getAssignedPeriodsForMapping(state, mapping.id);
    if (assigned > mapping.requiredPeriods) {
      conflicts.push({
        type: "mapping.over_allocated",
        mappingId: mapping.id,
        assigned,
        required: mapping.requiredPeriods,
      });
    }
  }

  // Teacher hours exceeded
  for (const teacher of state.teachers) {
    const assignedHours = getTeacherAssignedHours(state, teacher.id);
    if (assignedHours > teacher.maxWeeklyHours) {
      conflicts.push({
        type: "teacher.over_hours",
        teacherId: teacher.id,
        assignedHours,
        maxWeeklyHours: teacher.maxWeeklyHours,
      });
    }
  }

  return conflicts;
}

