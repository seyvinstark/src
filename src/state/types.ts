export type Id = string;

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export type SlotType = "class" | "break" | "lunch" | "locked";

export type Teacher = {
  id: Id;
  name: string;
  maxWeeklyHours: number;
};

export type Grade = {
  id: Id;
  label: string;
};

export type Subject = {
  id: Id;
  name: string;
};

export type CourseMapping = {
  id: Id;
  gradeId: Id;
  subjectId: Id;
  teacherId: Id;
  requiredPeriods: number;
};

export type TimeSlot = {
  id: Id;
  day: Day;
  start: string; // "08:45"
  end: string; // "09:30"
  type: SlotType;
  label?: string; // e.g. "DEVOTION", "BREAK", "LUNCH", "1"
};

export type Entry = {
  gradeId: Id;
  day: Day;
  slotId: Id;
  subjectId: Id;
  teacherId: Id;
};

export type RuleSettings = {
  enforceFreeSlotPerDay: boolean;
  enforceFridayShortDay: boolean;
};

export type AppState = {
  teachers: Teacher[];
  grades: Grade[];
  subjects: Subject[];
  mappings: CourseMapping[];
  timeSlots: TimeSlot[];
  entries: Entry[];
  rules: RuleSettings;
};

export type AppAction =
  | { type: "teacher.add"; teacher: Teacher }
  | { type: "teacher.update"; teacher: Teacher }
  | { type: "teacher.delete"; teacherId: Id }
  | { type: "grade.add"; grade: Grade }
  | { type: "grade.delete"; gradeId: Id }
  | { type: "subject.add"; subject: Subject }
  | { type: "subject.delete"; subjectId: Id }
  | { type: "mapping.add"; mapping: CourseMapping }
  | { type: "mapping.update"; mapping: CourseMapping }
  | { type: "mapping.delete"; mappingId: Id }
  | { type: "rules.update"; rules: Partial<RuleSettings> }
  | { type: "timeslots.set"; timeSlots: TimeSlot[] }
  | { type: "entry.place"; entry: Entry }
  | { type: "entry.clear"; gradeId: Id; day: Day; slotId: Id }
  | { type: "state.import"; state: AppState };

