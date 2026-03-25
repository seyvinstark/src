"use client";

import { useState } from "react";
import { Button, PageTitle, Select } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { listConflicts } from "@/domain/conflicts";
import { downloadPdf } from "@/pdf/exportPdf";
import { ClassTimetableDocument } from "@/pdf/ClassTimetableDocument";
import { TeacherTimetableDocument } from "@/pdf/TeacherTimetableDocument";
import type { Id } from "@/state/types";

export default function ExportPage() {
  const { state } = useAppState();
  const conflicts = listConflicts(state);
  const [includeFooter, setIncludeFooter] = useState(true);
  const [gradeId, setGradeId] = useState<Id>(state.grades[0]?.id ?? "");
  const [teacherId, setTeacherId] = useState<Id>(state.teachers[0]?.id ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const warnAndMaybeContinue = () => {
    if (conflicts.length === 0) return true;
    return window.confirm(
      `${conflicts.length} conflict(s) remain. Export anyway?`,
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageTitle title="Export" subtitle="Generate print-ready PDFs" />

      {conflicts.length ? (
        <div className="rounded-xl border border-amber-300/30 bg-amber-100/60 p-4 text-sm">
          <div className="font-semibold">Warning</div>
          <div className="mt-1 text-amber-800/80">
            {conflicts.length} conflict(s) detected. You can still export, but
            the output may be inconsistent.
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Options</div>
        <label className="mt-3 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={includeFooter}
            onChange={(e) => setIncludeFooter(e.target.checked)}
          />
          <span>Include footer timestamp</span>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Export all classes</div>
          <div className="mt-3 text-sm text-zinc-600">
            One PDF per grade (downloaded one by one for MVP).
          </div>
          <div className="mt-4">
            <Button
              disabled={!!busy}
              onClick={async () => {
                if (!warnAndMaybeContinue()) return;
                setBusy("classes");
                try {
                  for (const g of state.grades) {
                    await downloadPdf(
                      <ClassTimetableDocument
                        state={state}
                        gradeId={g.id}
                        footer={includeFooter}
                      />,
                      `class-${g.label}.pdf`,
                    );
                  }
                } finally {
                  setBusy(null);
                }
              }}
            >
              Export all classes PDF
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Export all teachers</div>
          <div className="mt-3 text-sm text-zinc-600">
            One PDF per teacher (downloaded one by one for MVP).
          </div>
          <div className="mt-4">
            <Button
              disabled={!!busy}
              onClick={async () => {
                if (!warnAndMaybeContinue()) return;
                setBusy("teachers");
                try {
                  for (const t of state.teachers) {
                    await downloadPdf(
                      <TeacherTimetableDocument
                        state={state}
                        teacherId={t.id}
                        footer={includeFooter}
                      />,
                      `teacher-${t.name}.pdf`,
                    );
                  }
                } finally {
                  setBusy(null);
                }
              }}
            >
              Export all teachers PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Export single grade</div>
          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <Select value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
                {state.grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="secondary"
              disabled={!!busy || !gradeId}
              onClick={async () => {
                if (!warnAndMaybeContinue()) return;
                const g = state.grades.find((x) => x.id === gradeId);
                if (!g) return;
                setBusy("single-grade");
                try {
                  await downloadPdf(
                    <ClassTimetableDocument state={state} gradeId={g.id} footer={includeFooter} />,
                    `class-${g.label}.pdf`,
                  );
                } finally {
                  setBusy(null);
                }
              }}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Export single teacher</div>
          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                {state.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="secondary"
              disabled={!!busy || !teacherId}
              onClick={async () => {
                if (!warnAndMaybeContinue()) return;
                const t = state.teachers.find((x) => x.id === teacherId);
                if (!t) return;
                setBusy("single-teacher");
                try {
                  await downloadPdf(
                    <TeacherTimetableDocument state={state} teacherId={t.id} footer={includeFooter} />,
                    `teacher-${t.name}.pdf`,
                  );
                } finally {
                  setBusy(null);
                }
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

