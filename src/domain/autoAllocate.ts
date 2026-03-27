import { validatePlacement } from "@/domain/validate";
import type { AppState, AutoAllocateResult, Entry, Id } from "@/state/types";

type AutoAllocateOptions = {
  gradeId?: Id;
};

type MappingProgress = {
  id: Id;
  gradeId: Id;
  subjectId: Id;
  teacherId: Id;
  requiredPeriods: number;
  assigned: number;
};

const DAY_ORDER: Record<Entry["day"], number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
};

function bySlotOrder(a: { day: string; start: string; id: Id }, b: { day: string; start: string; id: Id }) {
  if (a.day !== b.day) return DAY_ORDER[a.day as Entry["day"]] - DAY_ORDER[b.day as Entry["day"]];
  if (a.start !== b.start) return a.start.localeCompare(b.start);
  return a.id.localeCompare(b.id);
}

function isCellFilled(state: AppState, gradeId: Id, day: Entry["day"], slotId: Id) {
  return state.entries.some((e) => e.gradeId === gradeId && e.day === day && e.slotId === slotId);
}

export function autoAllocateEmptySlots(
  initialState: AppState,
  options: AutoAllocateOptions = {},
): { state: AppState; result: AutoAllocateResult } {
  let state = initialState;
  const gradeFilter = options.gradeId;

  const mappings = state.mappings
    .filter((m) => (gradeFilter ? m.gradeId === gradeFilter : true))
    .map<MappingProgress>((m) => ({
      id: m.id,
      gradeId: m.gradeId,
      subjectId: m.subjectId,
      teacherId: m.teacherId,
      requiredPeriods: m.requiredPeriods,
      assigned: state.entries.filter(
        (e) => e.gradeId === m.gradeId && e.subjectId === m.subjectId && e.teacherId === m.teacherId,
      ).length,
    }));

  const slots = state.timeSlots
    .filter((slot) => slot.type === "class")
    .sort((a, b) => bySlotOrder(a, b));

  let placedCount = 0;

  for (const grade of state.grades) {
    if (gradeFilter && grade.id !== gradeFilter) continue;

    for (const slot of slots) {
      if (isCellFilled(state, grade.id, slot.day, slot.id)) continue;

      const candidates = mappings
        .filter((m) => m.gradeId === grade.id)
        .filter((m) => m.assigned < m.requiredPeriods)
        .sort((a, b) => {
          const remainingA = a.requiredPeriods - a.assigned;
          const remainingB = b.requiredPeriods - b.assigned;
          if (remainingA !== remainingB) return remainingB - remainingA;

          const teacherLoadA = state.entries.filter((e) => e.teacherId === a.teacherId).length;
          const teacherLoadB = state.entries.filter((e) => e.teacherId === b.teacherId).length;
          if (teacherLoadA !== teacherLoadB) return teacherLoadA - teacherLoadB;

          return a.id.localeCompare(b.id);
        });

      for (const candidate of candidates) {
        const entry: Entry = {
          gradeId: grade.id,
          day: slot.day,
          slotId: slot.id,
          subjectId: candidate.subjectId,
          teacherId: candidate.teacherId,
        };

        const validation = validatePlacement(state, entry);
        if (!validation.ok) continue;

        state = {
          ...state,
          entries: [...state.entries, entry],
        };
        candidate.assigned += 1;
        placedCount += 1;
        break;
      }
    }
  }

  const filteredMappings = mappings.filter((m) => (gradeFilter ? m.gradeId === gradeFilter : true));
  const totalRequiredPeriods = filteredMappings.reduce((sum, m) => sum + m.requiredPeriods, 0);
  const totalAssignedPeriods = filteredMappings.reduce((sum, m) => sum + m.assigned, 0);
  const remainingRequiredPeriods = Math.max(0, totalRequiredPeriods - totalAssignedPeriods);

  return {
    state,
    result: {
      placedCount,
      remainingRequiredPeriods,
      totalRequiredPeriods,
    },
  };
}
