import type { AppAction, AppState } from "@/state/types";
import { applyPlacement, clearPlacement, deleteMappingAndEntries } from "@/domain/mutations";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "teacher.add":
      return { ...state, teachers: [...state.teachers, action.teacher] };
    case "teacher.update":
      return {
        ...state,
        teachers: state.teachers.map((t) => (t.id === action.teacher.id ? action.teacher : t)),
      };
    case "teacher.delete":
      return {
        ...state,
        teachers: state.teachers.filter((t) => t.id !== action.teacherId),
        mappings: state.mappings.filter((m) => m.teacherId !== action.teacherId),
        entries: state.entries.filter((e) => e.teacherId !== action.teacherId),
      };

    case "grade.add":
      return { ...state, grades: [...state.grades, action.grade] };
    case "grade.delete":
      return {
        ...state,
        grades: state.grades.filter((g) => g.id !== action.gradeId),
        mappings: state.mappings.filter((m) => m.gradeId !== action.gradeId),
        entries: state.entries.filter((e) => e.gradeId !== action.gradeId),
      };

    case "subject.add":
      return { ...state, subjects: [...state.subjects, action.subject] };
    case "subject.delete":
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.subjectId),
        mappings: state.mappings.filter((m) => m.subjectId !== action.subjectId),
        entries: state.entries.filter((e) => e.subjectId !== action.subjectId),
      };

    case "mapping.add":
      return { ...state, mappings: [...state.mappings, action.mapping] };
    case "mapping.update":
      return {
        ...state,
        mappings: state.mappings.map((m) => (m.id === action.mapping.id ? action.mapping : m)),
      };
    case "mapping.delete":
      return deleteMappingAndEntries(state, action.mappingId);

    case "rules.update":
      return { ...state, rules: { ...state.rules, ...action.rules } };

    case "timeslots.set":
      return { ...state, timeSlots: action.timeSlots };

    case "entry.place":
      return applyPlacement(state, action.entry);

    case "entry.clear":
      return clearPlacement(state, { gradeId: action.gradeId, day: action.day, slotId: action.slotId });

    case "state.import":
      return action.state;

    default:
      return state;
  }
}

