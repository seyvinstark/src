import type { AppState, Entry, ValidationReason } from "@/domain/validationTypes";
import { getEntryAt, getSlot, getTeacherAssignedHours, getTeacherEntryAt, getAssignedPeriodsForMapping } from "@/domain/selectors";

export function validatePlacement(state: AppState, nextEntry: Entry) {
  const reasons: ValidationReason[] = [];

  const slot = getSlot(state, nextEntry.slotId);
  if (!slot) reasons.push({ code: "slot.not_found" });
  if (slot && slot.type !== "class") reasons.push({ code: "slot.locked", slotType: slot.type });

  const existingGradeEntry = getEntryAt(state, {
    gradeId: nextEntry.gradeId,
    day: nextEntry.day,
    slotId: nextEntry.slotId,
  });
  if (existingGradeEntry) {
    // replacing is allowed (edit), so no reason here
  }

  const existingTeacherEntry = getTeacherEntryAt(state, {
    teacherId: nextEntry.teacherId,
    day: nextEntry.day,
    slotId: nextEntry.slotId,
  });
  if (existingTeacherEntry) {
    reasons.push({
      code: "teacher.double_booked",
      teacherId: nextEntry.teacherId,
      day: nextEntry.day,
      slotId: nextEntry.slotId,
    });
  }

  const mapping = state.mappings.find(
    (m) =>
      m.gradeId === nextEntry.gradeId &&
      m.subjectId === nextEntry.subjectId &&
      m.teacherId === nextEntry.teacherId,
  );
  if (!mapping) {
    reasons.push({ code: "mapping.missing" });
  } else {
    const assigned = getAssignedPeriodsForMapping(state, mapping.id);
    if (assigned >= mapping.requiredPeriods) {
      reasons.push({ code: "mapping.periods_exceeded", mappingId: mapping.id, assigned, required: mapping.requiredPeriods });
    }
  }

  const teacher = state.teachers.find((t) => t.id === nextEntry.teacherId);
  if (teacher) {
    const assignedHours = getTeacherAssignedHours(state, teacher.id);
    if (assignedHours >= teacher.maxWeeklyHours) {
      reasons.push({ code: "teacher.hours_exceeded", teacherId: teacher.id, assignedHours, maxWeeklyHours: teacher.maxWeeklyHours });
    }
  }

  // Friday short-day is modeled by making later Friday slot(s) locked in seed.
  // If user edits slots later, this stays enforced by slot type.

  return { ok: reasons.length === 0, reasons };
}

