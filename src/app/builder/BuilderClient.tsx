"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, PageTitle } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { TimetableGrid } from "@/components/TimetableGrid";
import type { Day, Entry, Id } from "@/state/types";
import { getAssignedPeriodsForMapping } from "@/domain/selectors";
import { validatePlacement } from "@/domain/validate";
import { autoAllocateEmptySlots } from "@/domain/autoAllocate";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { Draggable } from "@/components/dnd";

export default function BuilderClient() {
  const { state, dispatch } = useAppState();
  const params = useSearchParams();
  const jumpGradeId = params.get("gradeId") ?? "";
  const jumpDay = (params.get("day") as Day | null) ?? null;
  const jumpSlotId = params.get("slotId") ?? "";

  const [activeGradeId, setActiveGradeId] = useState<Id>(() => {
    const initial = jumpGradeId || state.grades[0]?.id || "";
    return initial;
  });
  const [selectedMappingId, setSelectedMappingId] = useState<Id | null>(null); // still supported for click-to-place
  const [draggingMappingId, setDraggingMappingId] = useState<Id | null>(null);
  const [draggingEntrySource, setDraggingEntrySource] = useState<{ day: Day; slotId: Id } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  const grade = state.grades.find((g) => g.id === activeGradeId);

  const mappingsForGrade = useMemo(() => {
    return state.mappings
      .filter((m) => m.gradeId === activeGradeId)
      .map((m) => ({
        m,
        assigned: getAssignedPeriodsForMapping(state, m.id),
        subjectName: state.subjects.find((s) => s.id === m.subjectId)?.name ?? "?",
        teacherName: state.teachers.find((t) => t.id === m.teacherId)?.name ?? "?",
      }));
  }, [state, activeGradeId]);

  const selectedMapping = selectedMappingId
    ? state.mappings.find((m) => m.id === selectedMappingId)
    : null;

  const emptyClassSlotsForActiveGrade = useMemo(() => {
    return state.timeSlots.filter((slot) => {
      if (slot.type !== "class") return false;
      return !state.entries.some(
        (e) => e.gradeId === activeGradeId && e.day === slot.day && e.slotId === slot.id,
      );
    }).length;
  }, [state, activeGradeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const droppableIdForCell = (args: { day: Day; slotId: Id }) =>
    `cell:${activeGradeId}:${args.day}:${args.slotId}`;

  const parseCellId = (id: string) => {
    const parts = id.split(":");
    if (parts.length !== 4) return null;
    if (parts[0] !== "cell") return null;
    return { gradeId: parts[1], day: parts[2] as Day, slotId: parts[3] };
  };

  const entryDraggableIdForCell = (args: { day: Day; slotId: Id }) =>
    `entry:${activeGradeId}:${args.day}:${args.slotId}`;

  const parseEntryId = (id: string) => {
    const parts = id.split(":");
    if (parts.length !== 4) return null;
    if (parts[0] !== "entry") return null;
    return { gradeId: parts[1], day: parts[2] as Day, slotId: parts[3] };
  };

  const movingEntry =
    draggingEntrySource
      ? state.entries.find(
          (e) =>
            e.gradeId === activeGradeId &&
            e.day === draggingEntrySource.day &&
            e.slotId === draggingEntrySource.slotId,
        )
      : null;

  const canDrop = (args: { day: Day; slotId: Id; slot: { type: string }; entry?: Entry }) => {
    if (movingEntry) {
      const stateWithoutSource = {
        ...state,
        entries: state.entries.filter(
          (e) =>
            !(
              e.gradeId === activeGradeId &&
              e.day === draggingEntrySource?.day &&
              e.slotId === draggingEntrySource?.slotId
            ),
        ),
      };
      const targetEntry: Entry = {
        ...movingEntry,
        day: args.day,
        slotId: args.slotId,
      };
      return validatePlacement(stateWithoutSource, targetEntry).ok;
    }

    const mappingId = draggingMappingId ?? selectedMappingId;
    if (!mappingId) return false;
    const mapping = state.mappings.find((m) => m.id === mappingId);
    if (!mapping) return false;
    const entry: Entry = {
      gradeId: activeGradeId,
      day: args.day,
      slotId: args.slotId,
      subjectId: mapping.subjectId,
      teacherId: mapping.teacherId,
    };
    return validatePlacement(state, entry).ok;
  };

  const place = (args: { day: Day; slotId: Id }) => {
    if (!selectedMapping) {
      setMessage("Select a course card first.");
      setMessageTone("error");
      return;
    }

    const entry: Entry = {
      gradeId: activeGradeId,
      day: args.day,
      slotId: args.slotId,
      subjectId: selectedMapping.subjectId,
      teacherId: selectedMapping.teacherId,
    };

    const res = validatePlacement(state, entry);
    if (!res.ok) {
      const reason = res.reasons[0];
      setMessage(
        reason.code === "teacher.double_booked"
          ? "Invalid: teacher already booked in another class at that time."
          : reason.code === "slot.locked"
            ? `Invalid: ${reason.slotType} slot is locked.`
            : reason.code === "mapping.periods_exceeded"
              ? "Invalid: required periods already met for this mapping."
              : reason.code === "teacher.hours_exceeded"
                ? "Invalid: teacher weekly hours limit reached."
                : "Invalid: placement blocked.",
      );
      setMessageTone("error");
      return;
    }

    dispatch({ type: "entry.place", entry });
    setMessage(null);
  };

  const onDragEnd = (evt: DragEndEvent) => {
    setDraggingMappingId(null);
    setDraggingEntrySource(null);
    const activeId = String(evt.active.id);
    const overId = evt.over?.id ? String(evt.over.id) : null;
    if (!overId) return;

    const cell = parseCellId(overId);
    if (!cell) return;
    if (cell.gradeId !== activeGradeId) return;

    if (activeId.startsWith("entry:")) {
      const from = parseEntryId(activeId);
      if (!from || from.gradeId !== activeGradeId) return;
      const sourceEntry = state.entries.find(
        (e) => e.gradeId === from.gradeId && e.day === from.day && e.slotId === from.slotId,
      );
      if (!sourceEntry) return;

      const stateWithoutSource = {
        ...state,
        entries: state.entries.filter(
          (e) => !(e.gradeId === from.gradeId && e.day === from.day && e.slotId === from.slotId),
        ),
      };
      const targetEntry: Entry = {
        ...sourceEntry,
        day: cell.day,
        slotId: cell.slotId,
      };
      const res = validatePlacement(stateWithoutSource, targetEntry);
      if (!res.ok) {
        setMessage("Invalid move: target slot violates timetable rules.");
        setMessageTone("error");
        return;
      }

      dispatch({ type: "entry.clear", gradeId: from.gradeId, day: from.day, slotId: from.slotId });
      dispatch({ type: "entry.place", entry: targetEntry });
      setMessage("Moved entry to new slot.");
      setMessageTone("success");
      return;
    }

    if (!activeId.startsWith("mapping:")) return;
    const mappingId = activeId.slice("mapping:".length);
    const mapping = state.mappings.find((m) => m.id === mappingId);
    if (!mapping) return;
    const entry: Entry = {
      gradeId: activeGradeId,
      day: cell.day,
      slotId: cell.slotId,
      subjectId: mapping.subjectId,
      teacherId: mapping.teacherId,
    };
    const res = validatePlacement(state, entry);
    if (!res.ok) {
      const reason = res.reasons[0];
      setMessage(
        reason.code === "teacher.double_booked"
          ? "Invalid drop: teacher already booked in another class at that time."
          : reason.code === "slot.locked"
            ? `Invalid drop: ${reason.slotType} slot is locked.`
            : reason.code === "mapping.periods_exceeded"
              ? "Invalid drop: required periods already met for this mapping."
              : reason.code === "teacher.hours_exceeded"
                ? "Invalid drop: teacher weekly hours limit reached."
                : "Invalid drop.",
      );
      setMessageTone("error");
      return;
    }
    dispatch({ type: "entry.place", entry });
    setMessage(null);
  };

  const onAutoAllocate = () => {
    const { result } = autoAllocateEmptySlots(state, { gradeId: activeGradeId });
    dispatch({ type: "allocation.auto", gradeId: activeGradeId });
    setSelectedMappingId(null);
    setMessageTone("success");
    setMessage(`Auto-allocated ${result.placedCount} period(s). Remaining required: ${result.remainingRequiredPeriods}.`);
  };

  const overlay = draggingMappingId ? state.mappings.find((m) => m.id === draggingMappingId) : null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Timetable Builder"
        subtitle="Drag a course card onto the grid (or click-to-place)"
      />

      <div className="flex flex-wrap gap-2">
        {state.grades.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveGradeId(g.id)}
            className={`rounded-lg px-3 py-2 text-sm border ${
              g.id === activeGradeId
                ? "border-blue-500/30 bg-blue-50 text-blue-700"
                : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => {
          const id = String(e.active.id);
          if (id.startsWith("mapping:")) setDraggingMappingId(id.slice("mapping:".length));
          if (id.startsWith("entry:")) {
            const parsed = parseEntryId(id);
            if (parsed && parsed.gradeId === activeGradeId) {
              setDraggingEntrySource({ day: parsed.day, slotId: parsed.slotId });
            }
          }
        }}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDraggingMappingId(null);
          setDraggingEntrySource(null);
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">
              Courses for {grade?.label ?? "—"}
            </div>
            <div className="mt-3 space-y-2">
              {mappingsForGrade.map(({ m, assigned, subjectName, teacherName }) => {
                const full = assigned >= m.requiredPeriods;
                const selected = selectedMappingId === m.id;
                return (
                  <div key={m.id}>
                    <Draggable id={`mapping:${m.id}`} disabled={full}>
                      <button
                        type="button"
                        disabled={full}
                        onClick={() => {
                          setSelectedMappingId(m.id);
                          setMessage(`Selected ${subjectName} (${teacherName}).`);
                          setMessageTone("success");
                        }}
                        className={`w-full text-left rounded-xl border px-3 py-3 transition-colors disabled:opacity-50 ${
                          selected
                            ? "border-blue-500/40 bg-blue-50"
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium">{subjectName}</div>
                            <div className="text-xs text-zinc-600">{teacherName}</div>
                          </div>
                          <div className="text-xs tabular-nums text-zinc-600">
                            {assigned}/{m.requiredPeriods}
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-zinc-200">
                          <div
                            className="h-2 rounded-full bg-blue-500/70"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((assigned / m.requiredPeriods) * 100),
                              )}%`,
                            }}
                          />
                        </div>
                      </button>
                    </Draggable>
                  </div>
                );
              })}

              {mappingsForGrade.length === 0 ? (
                <div className="text-sm text-zinc-600">
                  No mappings for this grade yet. Add them in Course Mapping.
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!selectedMappingId}
                onClick={() => {
                  setSelectedMappingId(null);
                  setMessage("Course selection cleared.");
                  setMessageTone("success");
                }}
              >
                Clear selection
              </Button>
              <Button
                onClick={onAutoAllocate}
                disabled={mappingsForGrade.length === 0 || emptyClassSlotsForActiveGrade === 0}
              >
                Auto Allocate
              </Button>
              {message ? (
                <div className={`text-xs ${messageTone === "error" ? "text-red-700" : "text-green-700"}`}>
                  {message}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <TimetableGrid
              state={state}
              mode="grade-edit"
              gradeId={activeGradeId}
              droppableIdForCell={droppableIdForCell}
              draggableEntryIdForCell={({ day, slotId }) => entryDraggableIdForCell({ day, slotId })}
              canDrop={canDrop}
              highlight={
                jumpGradeId && jumpGradeId === activeGradeId && jumpDay && jumpSlotId
                  ? { day: jumpDay, slotId: jumpSlotId }
                  : null
              }
              onCellClick={({ day, slotId, entry, slot }) => {
                if (slot.type !== "class") return;
                if (entry) {
                  dispatch({ type: "entry.clear", gradeId: activeGradeId, day, slotId });
                  setMessage(null);
                  return;
                }
                place({ day, slotId });
              }}
            />
          </div>
        </div>

        <DragOverlay>
          {overlay ? (
            <div className="rounded-xl border border-blue-500/20 bg-white px-3 py-2 shadow-lg">
              <div className="text-sm font-medium">
                {state.subjects.find((s) => s.id === overlay.subjectId)?.name ?? "?"}
              </div>
              <div className="text-xs text-zinc-600">
                {state.teachers.find((t) => t.id === overlay.teacherId)?.name ?? "?"}
              </div>
            </div>
          ) : movingEntry ? (
            <div className="rounded-xl border border-blue-500/20 bg-white px-3 py-2 shadow-lg">
              <div className="text-sm font-medium">
                {state.subjects.find((s) => s.id === movingEntry.subjectId)?.name ?? "?"}
              </div>
              <div className="text-xs text-zinc-600">
                {state.teachers.find((t) => t.id === movingEntry.teacherId)?.name ?? "?"}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

