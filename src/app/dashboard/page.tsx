"use client";

import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { listConflicts } from "@/domain/conflicts";
import { useEffect, useMemo, useState } from "react";
import type { Day, TimeSlot } from "@/state/types";
import { currentSlotIdForDay, todayAsDay } from "@/utils/time";

export default function DashboardPage() {
  const { state } = useAppState();
  const conflicts = listConflicts(state);
  const [now, setNow] = useState<Date>(() => new Date());
  const [day, setDay] = useState<Day>(() => todayAsDay(new Date()));

  const missingAllocations = state.mappings.filter((m) => {
    const assigned = state.entries.filter(
      (e) =>
        e.gradeId === m.gradeId &&
        e.subjectId === m.subjectId &&
        e.teacherId === m.teacherId,
    ).length;
    return assigned < m.requiredPeriods;
  }).length;

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const effectiveDay: Day = day;

  const daySlots = useMemo(() => {
    return state.timeSlots
      .filter((s) => s.day === effectiveDay)
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [state.timeSlots, effectiveDay]);

  const currentSlotId = useMemo(() => {
    return currentSlotIdForDay(state.timeSlots, effectiveDay, now);
  }, [state.timeSlots, effectiveDay, now]);

  const entryForTeacherSlot = (teacherId: string, slotId: string) =>
    state.entries.find(
      (e) => e.teacherId === teacherId && e.day === effectiveDay && e.slotId === slotId,
    );

  const entryForGradeSlot = (gradeId: string, slotId: string) =>
    state.entries.find(
      (e) => e.gradeId === gradeId && e.day === effectiveDay && e.slotId === slotId,
    );

  const labelForSlot = (s: TimeSlot) => s.label ?? s.type;

  return (
    <div>
      <PageTitle
        title="Dashboard"
        subtitle="Quick health overview and shortcuts"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Teachers" value={state.teachers.length} />
        <Card title="Grades" value={state.grades.length} />
        <Card
          title="Conflicts"
          value={conflicts.length}
          hint={conflicts.length ? "Needs resolving" : "All clear"}
        />
        <Card title="Missing allocations" value={missingAllocations} />
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Today calendar</div>
            <div className="text-xs text-zinc-600 mt-1">
              Now:{" "}
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
              • Day: {effectiveDay}
            </div>
          </div>

          <div className="flex gap-2">
            {(["Mon", "Tue", "Wed", "Thu", "Fri"] as Day[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  d === effectiveDay
                    ? "border-blue-500/30 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Per-grade “who is teaching now” strip */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {state.grades.map((g) => {
            const current = currentSlotId
              ? entryForGradeSlot(g.id, currentSlotId)
              : undefined;
            const teacher = current
              ? state.teachers.find((t) => t.id === current.teacherId)?.name ?? "?"
              : "—";
            const subject = current
              ? state.subjects.find((s) => s.id === current.subjectId)?.name ?? "?"
              : "No class";
            return (
              <div
                key={g.id}
                className={`rounded-xl border p-3 ${
                  current
                    ? "border-blue-500/20 bg-blue-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <div className="text-xs text-zinc-600">{g.label}</div>
                <div className="mt-1 text-sm font-semibold">
                  {subject}
                </div>
                <div className="text-xs text-zinc-600">{teacher}</div>
              </div>
            );
          })}
        </div>

        {/* Teacher “where are they now” grid */}
        <div className="mt-6 overflow-auto rounded-xl border border-zinc-200">
          <table className="min-w-[980px] w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-zinc-600 border-b border-zinc-200">
                  Teacher
                </th>
                {daySlots.map((s) => {
                  const isNow = currentSlotId && s.id === currentSlotId;
                  return (
                    <th
                      key={s.id}
                      className={`px-3 py-2 text-left text-xs border-b border-zinc-200 ${
                        isNow ? "bg-blue-50 text-blue-700" : "text-zinc-600"
                      }`}
                    >
                      <div className="font-semibold">{labelForSlot(s)}</div>
                      <div className="text-[11px] font-normal">
                        {s.start}–{s.end}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {state.teachers.map((t) => (
                <tr key={t.id}>
                  <td className="px-3 py-2 border-b border-zinc-100 font-medium whitespace-nowrap">
                    {t.name}
                  </td>
                  {daySlots.map((s) => {
                    const isNow = currentSlotId && s.id === currentSlotId;
                    if (s.type !== "class") {
                      return (
                        <td
                          key={s.id}
                          className={`px-3 py-2 border-b border-zinc-100 text-xs uppercase text-zinc-500 ${
                            isNow ? "bg-blue-50" : "bg-zinc-50"
                          }`}
                        >
                          {labelForSlot(s)}
                        </td>
                      );
                    }
                    const entry = entryForTeacherSlot(t.id, s.id);
                    if (!entry) {
                      return (
                        <td
                          key={s.id}
                          className={`px-3 py-2 border-b border-zinc-100 text-zinc-400 ${
                            isNow ? "bg-blue-50" : ""
                          }`}
                        >
                          —
                        </td>
                      );
                    }
                    const grade = state.grades.find((g) => g.id === entry.gradeId)?.label ?? "?";
                    const subject = state.subjects.find((sub) => sub.id === entry.subjectId)?.name ?? "?";
                    return (
                      <td
                        key={s.id}
                        className={`px-3 py-2 border-b border-zinc-100 ${
                          isNow ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="text-xs text-zinc-600">{grade}</div>
                        <div className="font-semibold">{subject}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Quick actions</div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            href="/course-mapping"
          >
            Go to Course Mapping
          </Link>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            href="/builder"
          >
            Go to Builder
          </Link>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            href="/conflicts"
          >
            Go to Conflicts
          </Link>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            href="/export"
          >
            Go to Export
          </Link>
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
            href="/settings"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

