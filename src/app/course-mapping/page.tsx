"use client";

import { useMemo, useState } from "react";
import { Button, Input, PageTitle, Select } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import type { CourseMapping, Grade, Subject, Teacher } from "@/state/types";
import { getAssignedPeriodsForMapping, getTeacherAssignedHours } from "@/domain/selectors";

function slugId(prefix: string, name: string) {
  return `${prefix}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
}

export default function CourseMappingPage() {
  const { state, dispatch } = useAppState();

  const [newTeacherName, setNewTeacherName] = useState("");
  const [newGradeLabel, setNewGradeLabel] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [mapGradeId, setMapGradeId] = useState(state.grades[0]?.id ?? "");
  const [mapSubjectId, setMapSubjectId] = useState(state.subjects[0]?.id ?? "");
  const [mapTeacherId, setMapTeacherId] = useState(state.teachers[0]?.id ?? "");
  const [mapRequired, setMapRequired] = useState<number>(5);

  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingTeacherName, setEditingTeacherName] = useState("");

  const [editingMappingId, setEditingMappingId] = useState<string | null>(null);
  const [editingRequiredPeriods, setEditingRequiredPeriods] = useState<number>(0);

  const mappingRows = useMemo(() => {
    return state.mappings.map((m) => {
      const grade = state.grades.find((g) => g.id === m.gradeId);
      const subject = state.subjects.find((s) => s.id === m.subjectId);
      const teacher = state.teachers.find((t) => t.id === m.teacherId);
      const assigned = getAssignedPeriodsForMapping(state, m.id);
      const status = assigned > m.requiredPeriods ? "OVER" : assigned === m.requiredPeriods ? "FULL" : "OK";
      return { m, grade, subject, teacher, assigned, status };
    });
  }, [state]);

  return (
    <div className="space-y-8">
      <PageTitle
        title="Course Mapping"
        subtitle="Configure teachers, grades, subjects, and required weekly periods"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Add entities</div>

          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Teacher name"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
              />
              <Button
                onClick={() => {
                  const name = newTeacherName.trim();
                  if (!name) return;
                  const teacher: Teacher = { id: slugId("t", name), name, maxWeeklyHours: 20 };
                  dispatch({ type: "teacher.add", teacher });
                  setNewTeacherName("");
                }}
              >
                Add
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Grade label (e.g., G4)"
                value={newGradeLabel}
                onChange={(e) => setNewGradeLabel(e.target.value)}
              />
              <Button
                onClick={() => {
                  const label = newGradeLabel.trim();
                  if (!label) return;
                  const grade: Grade = { id: slugId("g", label), label };
                  dispatch({ type: "grade.add", grade });
                  setNewGradeLabel("");
                }}
              >
                Add
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder="Subject name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
              <Button
                onClick={() => {
                  const name = newSubjectName.trim();
                  if (!name) return;
                  const subject: Subject = { id: slugId("s", name), name };
                  dispatch({ type: "subject.add", subject });
                  setNewSubjectName("");
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Teacher weekly limits</div>
          <div className="mt-4 space-y-2">
            {state.teachers.map((t) => {
              const used = getTeacherAssignedHours(state, t.id);
              const status = used > t.maxWeeklyHours ? "EXCEEDED" : "OK";
              const editing = editingTeacherId === t.id;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    {editing ? (
                      <div className="max-w-[240px]">
                        <Input
                          value={editingTeacherName}
                          onChange={(e) => setEditingTeacherName(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-medium">{t.name}</div>
                    )}
                    <div className="text-xs text-zinc-600">
                      Used {used} / {t.maxWeeklyHours} • {status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-[120px]">
                      <Input
                        type="number"
                        min={0}
                        value={t.maxWeeklyHours}
                        onChange={(e) => {
                          const maxWeeklyHours = Number(e.target.value || 0);
                          dispatch({ type: "teacher.update", teacher: { ...t, maxWeeklyHours } });
                        }}
                      />
                    </div>

                    {editing ? (
                      <>
                        <Button
                          onClick={() => {
                            const name = editingTeacherName.trim();
                            if (!name) return;
                            dispatch({ type: "teacher.update", teacher: { ...t, name } });
                            setEditingTeacherId(null);
                            setEditingTeacherName("");
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingTeacherId(null);
                            setEditingTeacherName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingTeacherId(t.id);
                            setEditingTeacherName(t.name);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            const ok = window.confirm(
                              "Delete this teacher? Related mappings and timetable entries will be removed.",
                            );
                            if (!ok) return;
                            dispatch({ type: "teacher.delete", teacherId: t.id });
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Add mapping</div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select value={mapGradeId} onChange={(e) => setMapGradeId(e.target.value)}>
            {state.grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </Select>
          <Select value={mapSubjectId} onChange={(e) => setMapSubjectId(e.target.value)}>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select value={mapTeacherId} onChange={(e) => setMapTeacherId(e.target.value)}>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={1}
            value={mapRequired}
            onChange={(e) => setMapRequired(Number(e.target.value || 0))}
          />
        </div>
        <div className="mt-3">
          <Button
            onClick={() => {
              if (!mapGradeId || !mapSubjectId || !mapTeacherId || mapRequired <= 0) return;
              const mapping: CourseMapping = {
                id: `m-${mapGradeId}-${mapSubjectId}-${mapTeacherId}-${Date.now().toString(36)}`,
                gradeId: mapGradeId,
                subjectId: mapSubjectId,
                teacherId: mapTeacherId,
                requiredPeriods: mapRequired,
              };
              dispatch({ type: "mapping.add", mapping });
            }}
          >
            Add mapping
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Mappings</div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="text-xs text-zinc-600">
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 pr-4">Grade</th>
                <th className="text-left py-2 pr-4">Subject</th>
                <th className="text-left py-2 pr-4">Teacher</th>
                <th className="text-right py-2 pr-4">Required</th>
                <th className="text-right py-2 pr-4">Assigned</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-right py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappingRows.map(({ m, grade, subject, teacher, assigned, status }) => (
                <tr key={m.id} className="border-b border-zinc-100">
                  <td className="py-2 pr-4">{grade?.label ?? "?"}</td>
                  <td className="py-2 pr-4">{subject?.name ?? "?"}</td>
                  <td className="py-2 pr-4">{teacher?.name ?? "?"}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {editingMappingId === m.id ? (
                      <div className="flex justify-end">
                        <div className="w-[110px]">
                          <Input
                            type="number"
                            min={1}
                            value={editingRequiredPeriods}
                            onChange={(e) => setEditingRequiredPeriods(Number(e.target.value || 0))}
                          />
                        </div>
                      </div>
                    ) : (
                      m.requiredPeriods
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{assigned}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        status === "OVER"
                          ? "bg-red-500/15 text-red-700 border border-red-500/20"
                          : status === "FULL"
                            ? "bg-blue-500/15 text-blue-700 border border-blue-500/20"
                            : "bg-green-500/15 text-green-700 border border-green-500/20"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right">
                    <div className="flex justify-end gap-2">
                      {editingMappingId === m.id ? (
                        <>
                          <Button
                            onClick={() => {
                              if (editingRequiredPeriods <= 0) return;
                              dispatch({
                                type: "mapping.update",
                                mapping: { ...m, requiredPeriods: editingRequiredPeriods },
                              });
                              setEditingMappingId(null);
                              setEditingRequiredPeriods(0);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditingMappingId(null);
                              setEditingRequiredPeriods(0);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditingMappingId(m.id);
                              setEditingRequiredPeriods(m.requiredPeriods);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => {
                              const ok = window.confirm(
                                "Delete this mapping? Related timetable entries will be removed.",
                              );
                              if (!ok) return;
                              dispatch({ type: "mapping.delete", mappingId: m.id });
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {mappingRows.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={7}>
                    No mappings yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

