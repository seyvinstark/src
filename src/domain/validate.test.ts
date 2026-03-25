import test from "node:test";
import assert from "node:assert/strict";
import type { AppState, Entry } from "@/state/types";
import { seedState } from "@/state/seed";
import { validatePlacement } from "@/domain/validate";

test("validatePlacement blocks placement into break/lunch slots", () => {
  const state = seedState();
  const breakSlot = state.timeSlots.find((s) => s.type === "break");
  assert.ok(breakSlot);
  const mapping = state.mappings[0];
  const entry: Entry = {
    gradeId: mapping.gradeId,
    day: breakSlot.day,
    slotId: breakSlot.id,
    subjectId: mapping.subjectId,
    teacherId: mapping.teacherId,
  };
  const res = validatePlacement(state, entry);
  assert.equal(res.ok, false);
  assert.ok(res.reasons.some((r) => r.code === "slot.locked"));
});

test("validatePlacement blocks teacher double-booking at same day/slot", () => {
  const state = seedState();
  const mapping = state.mappings[0];
  const classSlot = state.timeSlots.find((s) => s.day === "Mon" && s.type === "class");
  assert.ok(classSlot);

  const first: Entry = {
    gradeId: mapping.gradeId,
    day: "Mon",
    slotId: classSlot.id,
    subjectId: mapping.subjectId,
    teacherId: mapping.teacherId,
  };
  const otherGradeId = state.grades.find((g) => g.id !== mapping.gradeId)!.id;
  const second: Entry = { ...first, gradeId: otherGradeId };

  const withFirst: AppState = { ...state, entries: [first] };
  const res = validatePlacement(withFirst, second);
  assert.equal(res.ok, false);
  assert.ok(res.reasons.some((r) => r.code === "teacher.double_booked"));
});

