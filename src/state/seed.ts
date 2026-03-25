import type { AppState, Day, TimeSlot } from "@/state/types";

function makeSlotsForDay(day: Day): TimeSlot[] {
  const mk = (
    id: string,
    start: string,
    end: string,
    type: TimeSlot["type"],
    label?: string,
  ) => ({
    id,
    day,
    start,
    end,
    type,
    label,
  });

  // Template aligned to the PDFs (aSc Timetables):
  // - DEVOTION 08:15-08:45
  // - Periods 1..8
  // - BREAK and LUNCH locked
  return [
    mk(`${day}-0815`, "08:15", "08:45", "locked", "DEVOTION"),
    mk(`${day}-0845`, "08:45", "09:30", "class", "1"),
    mk(`${day}-0930`, "09:30", "10:15", "class", "2"),
    mk(`${day}-1015`, "10:15", "10:45", "break", "BREAK"),
    mk(`${day}-1045`, "10:45", "11:30", "class", "3"),
    mk(`${day}-1130`, "11:30", "12:15", "class", "4"),
    mk(`${day}-1215`, "12:15", "13:00", "class", "5"),
    mk(`${day}-1300`, "13:00", "14:00", "lunch", "LUNCH"),
    mk(`${day}-1400`, "14:00", "14:45", "class", "6"),
    mk(`${day}-1445`, "14:45", "15:30", "class", "7"),
    mk(
      `${day}-1530`,
      "15:30",
      "16:15",
      day === "Fri" ? "locked" : "class",
      "8",
    ),
  ];
}

export function seedState(): AppState {
  const teachers = [
    { id: "t-caroline", name: "Caroline", maxWeeklyHours: 20 },
    { id: "t-janet", name: "Janet", maxWeeklyHours: 20 },
    { id: "t-germaine", name: "Germaine", maxWeeklyHours: 20 },
  ];

  const grades = [
    { id: "g1", label: "G1" },
    { id: "g2", label: "G2" },
    { id: "g3", label: "G3" },
  ];

  const subjects = [
    { id: "s-math", name: "Math" },
    { id: "s-english", name: "English" },
    { id: "s-science", name: "Science" },
    { id: "s-gp", name: "GP" },
  ];

  const mappings = [
    { id: "m-g1-math", gradeId: "g1", subjectId: "s-math", teacherId: "t-caroline", requiredPeriods: 7 },
    { id: "m-g1-eng", gradeId: "g1", subjectId: "s-english", teacherId: "t-janet", requiredPeriods: 6 },
    { id: "m-g1-sci", gradeId: "g1", subjectId: "s-science", teacherId: "t-caroline", requiredPeriods: 3 },
    { id: "m-g2-math", gradeId: "g2", subjectId: "s-math", teacherId: "t-germaine", requiredPeriods: 7 },
    { id: "m-g3-gp", gradeId: "g3", subjectId: "s-gp", teacherId: "t-janet", requiredPeriods: 2 },
  ];

  const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = days.flatMap((d) => makeSlotsForDay(d));

  return {
    teachers,
    grades,
    subjects,
    mappings,
    timeSlots,
    entries: [],
    rules: {
      enforceFreeSlotPerDay: false,
      enforceFridayShortDay: true,
    },
  };
}

