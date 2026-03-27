import test from "node:test";
import assert from "node:assert/strict";
import { autoAllocateEmptySlots } from "@/domain/autoAllocate";
import { seedState } from "@/state/seed";
import type { AppState, Entry } from "@/state/types";

function countForMapping(state: AppState, mappingId: string) {
  const mapping = state.mappings.find((m) => m.id === mappingId);
  assert.ok(mapping);
  return state.entries.filter(
    (e) =>
      e.gradeId === mapping.gradeId &&
      e.subjectId === mapping.subjectId &&
      e.teacherId === mapping.teacherId,
  ).length;
}

test("autoAllocateEmptySlots keeps existing manual entries untouched", () => {
  const state = seedState();
  const mapping = state.mappings[0];
  const slot = state.timeSlots.find((s) => s.day === "Mon" && s.type === "class");
  assert.ok(slot);

  const manual: Entry = {
    gradeId: mapping.gradeId,
    day: slot.day,
    slotId: slot.id,
    subjectId: mapping.subjectId,
    teacherId: mapping.teacherId,
  };

  const withManual: AppState = { ...state, entries: [manual] };
  const next = autoAllocateEmptySlots(withManual, { gradeId: mapping.gradeId }).state;

  assert.ok(
    next.entries.some(
      (e) =>
        e.gradeId === manual.gradeId &&
        e.day === manual.day &&
        e.slotId === manual.slotId &&
        e.subjectId === manual.subjectId &&
        e.teacherId === manual.teacherId,
    ),
  );
});

test("autoAllocateEmptySlots is deterministic for same input", () => {
  const state = seedState();
  const a = autoAllocateEmptySlots(state, { gradeId: "g1" });
  const b = autoAllocateEmptySlots(state, { gradeId: "g1" });

  assert.equal(JSON.stringify(a.state.entries), JSON.stringify(b.state.entries));
  assert.deepEqual(a.result, b.result);
});

test("autoAllocateEmptySlots respects mapping and teacher limits", () => {
  const state = seedState();
  const { state: next } = autoAllocateEmptySlots(state);

  for (const mapping of next.mappings) {
    const assigned = countForMapping(next, mapping.id);
    assert.ok(assigned <= mapping.requiredPeriods);
  }

  for (const teacher of next.teachers) {
    const assignedHours = next.entries.filter((e) => e.teacherId === teacher.id).length;
    assert.ok(assignedHours <= teacher.maxWeeklyHours);
  }

  for (const entry of next.entries) {
    const slot = next.timeSlots.find((s) => s.id === entry.slotId && s.day === entry.day);
    assert.ok(slot);
    assert.equal(slot.type, "class");
  }
});

