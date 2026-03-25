import type { AppState, Entry, Id } from "@/state/types";
import { validatePlacement } from "@/domain/validate";

export function applyPlacement(state: AppState, entry: Entry): AppState {
  const result = validatePlacement(state, entry);
  if (!result.ok) return state;

  const nextEntries = state.entries.filter(
    (e) => !(e.gradeId === entry.gradeId && e.day === entry.day && e.slotId === entry.slotId),
  );

  return { ...state, entries: [...nextEntries, entry] };
}

export function clearPlacement(
  state: AppState,
  target: { gradeId: Id; day: Entry["day"]; slotId: Id },
): AppState {
  return {
    ...state,
    entries: state.entries.filter(
      (e) => !(e.gradeId === target.gradeId && e.day === target.day && e.slotId === target.slotId),
    ),
  };
}

export function deleteMappingAndEntries(state: AppState, mappingId: Id): AppState {
  const mapping = state.mappings.find((m) => m.id === mappingId);
  if (!mapping) return state;
  return {
    ...state,
    mappings: state.mappings.filter((m) => m.id !== mappingId),
    entries: state.entries.filter(
      (e) => !(e.gradeId === mapping.gradeId && e.subjectId === mapping.subjectId && e.teacherId === mapping.teacherId),
    ),
  };
}

