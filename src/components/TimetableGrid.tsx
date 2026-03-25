"use client";

import { useMemo } from "react";
import type { AppState, Day, Entry, Id, TimeSlot } from "@/state/types";
import { Droppable } from "@/components/dnd";

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function TimetableGrid({
  state,
  mode,
  gradeId,
  teacherId,
  onCellClick,
  highlight,
  renderCell,
  droppableIdForCell,
  canDrop,
}: {
  state: AppState;
  mode: "grade-edit" | "teacher-readonly";
  gradeId?: Id;
  teacherId?: Id;
  onCellClick?: (key: { day: Day; slotId: Id; slot: TimeSlot; entry?: Entry }) => void;
  highlight?: { day: Day; slotId: Id } | null;
  renderCell?: (args: { entry?: Entry; slot: TimeSlot }) => React.ReactNode;
  droppableIdForCell?: (args: { day: Day; slotId: Id }) => string;
  canDrop?: (args: { day: Day; slotId: Id; slot: TimeSlot; entry?: Entry }) => boolean;
}) {
  const slotsByDay = useMemo(() => {
    const map = new Map<Day, TimeSlot[]>();
    for (const day of days) {
      map.set(
        day,
        state.timeSlots
          .filter((s) => s.day === day)
          .sort((a, b) => a.start.localeCompare(b.start)),
      );
    }
    return map;
  }, [state.timeSlots]);

  const rowKeys = useMemo(() => {
    // Build rows by unique start times across Mon..Fri (assuming same template)
    const starts = new Set<string>();
    for (const s of state.timeSlots) starts.add(`${s.start}-${s.end}`);
    return Array.from(starts).sort((a, b) => a.localeCompare(b));
  }, [state.timeSlots]);

  const slotAt = (day: Day, startEnd: string) => {
    const [start, end] = startEnd.split("-");
    return slotsByDay.get(day)?.find((s) => s.start === start && s.end === end);
  };

  const entryAt = (day: Day, slotId: Id) => {
    if (mode === "grade-edit") {
      if (!gradeId) return undefined;
      return state.entries.find((e) => e.gradeId === gradeId && e.day === day && e.slotId === slotId);
    }
    if (!teacherId) return undefined;
    return state.entries.find((e) => e.teacherId === teacherId && e.day === day && e.slotId === slotId);
  };

  return (
    <div className="overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-[820px] w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="text-left px-3 py-2 text-xs text-zinc-600 border-b border-zinc-200">
              Time
            </th>
            {days.map((d) => (
              <th
                key={d}
                className="text-left px-3 py-2 text-xs text-zinc-600 border-b border-zinc-200"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((startEnd) => (
            <tr key={startEnd}>
              <td className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-100 whitespace-nowrap">
                {startEnd.replace("-", "–")}
              </td>
              {days.map((day) => {
                const slot = slotAt(day, startEnd);
                if (!slot) {
                  return (
                    <td key={day} className="border-b border-zinc-100 px-2 py-2" />
                  );
                }

                const entry = entryAt(day, slot.id);
                const isLocked = slot.type !== "class";
                const isHighlight = highlight?.day === day && highlight?.slotId === slot.id;

                const base =
                  "border-b border-zinc-100 px-2 py-2 align-top";
                const cellCls = isLocked
                  ? "bg-zinc-50 text-zinc-500"
                  : "bg-white hover:bg-zinc-50";

                const ring = isHighlight ? " ring-2 ring-blue-500/30" : "";

                return (
                  <td key={`${day}-${slot.id}`} className={`${base} ${cellCls} ${ring}`}>
                    {droppableIdForCell && mode === "grade-edit" && slot.type === "class" ? (
                      <Droppable
                        id={droppableIdForCell({ day, slotId: slot.id })}
                        disabled={false}
                        invalid={canDrop ? !canDrop({ day, slotId: slot.id, slot, entry }) : false}
                        className="rounded-lg"
                      >
                        <button
                          type="button"
                          disabled={isLocked || !onCellClick}
                          onClick={() => onCellClick?.({ day, slotId: slot.id, slot, entry })}
                          className="w-full text-left disabled:cursor-not-allowed"
                        >
                          {renderCell ? (
                            renderCell({ entry, slot })
                          ) : entry ? (
                            <div>
                              <div className="font-medium">
                                {state.subjects.find((s) => s.id === entry.subjectId)?.name ?? "?"}
                              </div>
                              <div className="text-xs text-zinc-600">
                                {state.teachers.find((t) => t.id === entry.teacherId)?.name ?? "?"}
                              </div>
                            </div>
                          ) : (
                            <div className="h-[36px] rounded-lg border border-dashed border-zinc-200 bg-white" />
                          )}
                        </button>
                      </Droppable>
                    ) : (
                      <button
                        type="button"
                        disabled={isLocked || !onCellClick}
                        onClick={() => onCellClick?.({ day, slotId: slot.id, slot, entry })}
                        className="w-full text-left disabled:cursor-not-allowed"
                      >
                        {isLocked ? (
                          <div className="text-xs font-medium uppercase tracking-wide">
                            {(slot.label ?? slot.type).toUpperCase()}
                          </div>
                        ) : renderCell ? (
                          renderCell({ entry, slot })
                        ) : entry ? (
                          <div>
                            <div className="font-medium">
                              {state.subjects.find((s) => s.id === entry.subjectId)?.name ?? "?"}
                            </div>
                            <div className="text-xs text-zinc-600">
                              {state.teachers.find((t) => t.id === entry.teacherId)?.name ?? "?"}
                            </div>
                          </div>
                        ) : (
                          <div className="h-[36px] rounded-lg border border-dashed border-zinc-200 bg-white" />
                        )}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

