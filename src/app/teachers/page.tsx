"use client";

import { useMemo, useState } from "react";
import { PageTitle, Select } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { TimetableGrid } from "@/components/TimetableGrid";
import { getTeacherAssignedHours } from "@/domain/selectors";
import type { Id } from "@/state/types";

export default function TeachersPage() {
  const { state } = useAppState();
  const [teacherId, setTeacherId] = useState<Id>(state.teachers[0]?.id ?? "");

  const teacher = useMemo(() => state.teachers.find((t) => t.id === teacherId), [state.teachers, teacherId]);
  const used = teacher ? getTeacherAssignedHours(state, teacher.id) : 0;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Teacher View"
        subtitle="Read-only weekly schedule and workload summary"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[260px]">
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="rounded-full border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm">
          Workload:{" "}
          <span className="font-semibold tabular-nums">
            {used} / {teacher?.maxWeeklyHours ?? 0}
          </span>
        </div>
      </div>

      <TimetableGrid
        state={state}
        mode="teacher-readonly"
        teacherId={teacherId}
        renderCell={({ entry }) => {
          if (!entry) return <div className="h-[36px] rounded-lg border border-dashed border-zinc-800" />;
          const grade = state.grades.find((g) => g.id === entry.gradeId)?.label ?? "?";
          const subject = state.subjects.find((s) => s.id === entry.subjectId)?.name ?? "?";
          return (
            <div>
              <div className="text-xs text-zinc-400">{grade}</div>
              <div className="font-medium">{subject}</div>
            </div>
          );
        }}
      />
    </div>
  );
}

