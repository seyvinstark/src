import type { Day, TimeSlot } from "@/state/types";

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function todayAsDay(d = new Date()): Day {
  // JS: 0 Sun, 1 Mon ... 6 Sat
  const day = d.getDay();
  if (day === 1) return "Mon";
  if (day === 2) return "Tue";
  if (day === 3) return "Wed";
  if (day === 4) return "Thu";
  if (day === 5) return "Fri";
  // Weekend fallback for school timetable
  return "Mon";
}

export function currentSlotIdForDay(
  slots: TimeSlot[],
  day: Day,
  now = new Date(),
): string | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const daySlots = slots
    .filter((s) => s.day === day)
    .slice()
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  for (const s of daySlots) {
    const start = toMinutes(s.start);
    const end = toMinutes(s.end);
    if (minutes >= start && minutes < end) return s.id;
  }
  return null;
}

