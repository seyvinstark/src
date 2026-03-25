"use client";

import { PageTitle } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { listConflicts } from "@/domain/conflicts";
import Link from "next/link";

export default function ConflictsPage() {
  const { state } = useAppState();
  const conflicts = listConflicts(state);

  const teacherName = (id: string) => state.teachers.find((t) => t.id === id)?.name ?? "?";
  const mappingLabel = (id: string) => {
    const m = state.mappings.find((x) => x.id === id);
    if (!m) return "?";
    const g = state.grades.find((x) => x.id === m.gradeId)?.label ?? "?";
    const s = state.subjects.find((x) => x.id === m.subjectId)?.name ?? "?";
    return `${g} • ${s}`;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle title="Conflict Checker" subtitle="List and jump to issues" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="text-sm font-semibold">Conflicts ({conflicts.length})</div>
        <div className="mt-4 space-y-3">
          {conflicts.length === 0 ? (
            <div className="text-sm text-zinc-400">No conflicts detected.</div>
          ) : null}

          {conflicts.map((c, idx) => {
            if (c.type === "teacher.double_booked") {
              const first = c.entries[0];
              return (
                <div
                  key={`${c.type}-${idx}`}
                  className="rounded-xl border border-rose-400/20 bg-rose-950/20 p-3"
                >
                  <div className="text-sm font-medium">
                    Teacher double-booked: {teacherName(c.teacherId)} at {c.day} {c.slotId}
                  </div>
                  <div className="mt-1 text-xs text-rose-200/80">
                    {c.entries.length} entries share the same slot.
                  </div>
                  <div className="mt-3 flex gap-3 text-sm">
                    <Link
                      href={`/builder?gradeId=${encodeURIComponent(
                        first.gradeId,
                      )}&day=${encodeURIComponent(first.day)}&slotId=${encodeURIComponent(
                        first.slotId,
                      )}`}
                      className="rounded-lg border border-rose-400/30 px-3 py-2 hover:bg-rose-950/30"
                    >
                      Jump to slot
                    </Link>
                  </div>
                </div>
              );
            }

            if (c.type === "mapping.over_allocated") {
              return (
                <div
                  key={`${c.type}-${idx}`}
                  className="rounded-xl border border-amber-300/20 bg-amber-950/20 p-3"
                >
                  <div className="text-sm font-medium">
                    Over-allocated mapping: {mappingLabel(c.mappingId)}
                  </div>
                  <div className="mt-1 text-xs text-amber-200/80">
                    Assigned {c.assigned} / Required {c.required}
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/course-mapping"
                      className="rounded-lg border border-amber-300/30 px-3 py-2 hover:bg-amber-950/30 text-sm inline-block"
                    >
                      Open mapping
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${c.type}-${idx}`}
                className="rounded-xl border border-amber-300/20 bg-amber-950/20 p-3"
              >
                <div className="text-sm font-medium">
                  Teacher overload: {teacherName(c.teacherId)}
                </div>
                <div className="mt-1 text-xs text-amber-200/80">
                  Assigned {c.assignedHours} / Max {c.maxWeeklyHours}
                </div>
                <div className="mt-3">
                  <Link
                    href="/teachers"
                    className="rounded-lg border border-amber-300/30 px-3 py-2 hover:bg-amber-950/30 text-sm inline-block"
                  >
                    View teacher
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

