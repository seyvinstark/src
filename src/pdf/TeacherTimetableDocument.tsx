import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AppState, Day, Id } from "@/state/types";

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const styles = StyleSheet.create({
  page: { padding: 18, fontSize: 10 },
  topMeta: { fontSize: 9, color: "#333", marginBottom: 6 },
  routineTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  routineDays: { fontSize: 8, color: "#333", marginBottom: 1 },
  routineLine: { fontSize: 8, color: "#333", marginBottom: 8 },
  school: { fontSize: 14, fontWeight: 700, textAlign: "center", marginTop: 2 },
  who: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 10 },
  table: { display: "flex", flexDirection: "column", borderWidth: 1, borderColor: "#ddd" },
  headerRow: { flexDirection: "row", backgroundColor: "#f6f6f6", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  cellTime: { width: "16%", padding: 6, borderRightWidth: 1, borderRightColor: "#eee" },
  cell: { width: "16.8%", padding: 6, borderRightWidth: 1, borderRightColor: "#eee" },
  cellLast: { width: "16.8%", padding: 6 },
  cellTitle: { fontSize: 9, fontWeight: 700 },
  cellSub: { fontSize: 8, color: "#666", marginTop: 2 },
  locked: { color: "#999" },
  timeSlotLabel: { fontSize: 8, fontWeight: 700, marginBottom: 2, color: "#333" },
  timeSlotTime: { fontSize: 8, color: "#333" },
});

function rowKeys(state: AppState) {
  const starts = new Set<string>();
  for (const s of state.timeSlots) starts.add(`${s.start}-${s.end}`);
  return Array.from(starts).sort((a, b) => a.localeCompare(b));
}

export function TeacherTimetableDocument({
  state,
  teacherId,
  schoolLabel = "WISMA INTERNATIONAL SCHOOL",
  footer = true,
}: {
  state: AppState;
  teacherId: Id;
  schoolLabel?: string;
  footer?: boolean;
}) {
  const teacher = state.teachers.find((t) => t.id === teacherId)?.name ?? "Teacher";
  const keys = rowKeys(state);

  const slotAt = (day: Day, startEnd: string) => {
    const [start, end] = startEnd.split("-");
    return state.timeSlots.find((s) => s.day === day && s.start === start && s.end === end);
  };

  const entryAt = (day: Day, slotId: Id) =>
    state.entries.find((e) => e.teacherId === teacherId && e.day === day && e.slotId === slotId);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.topMeta}>
          Timetable generated:{new Date().toLocaleDateString()}{"\t"}aSc Timetables
        </Text>
        <Text style={styles.routineTitle}>DEVOTION &amp; ROUTINE</Text>
        <Text style={styles.routineDays}>Mo   Tu   We   Th   Fr</Text>
        <Text style={styles.routineLine}>DEVOTION{"  "}8:15 - 8:45</Text>
        <Text style={styles.school}>{schoolLabel}</Text>
        <Text style={styles.who}>Teacher {teacher}</Text>

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <View style={styles.cellTime}>
              <Text style={styles.cellTitle}>Time</Text>
            </View>
            {days.map((d, i) => (
              <View key={d} style={i === days.length - 1 ? styles.cellLast : styles.cell}>
                <Text style={styles.cellTitle}>{d}</Text>
              </View>
            ))}
          </View>

          {keys.map((startEnd) => (
            <View key={startEnd} style={styles.row}>
              <View style={styles.cellTime}>
                {(() => {
                  const ref =
                    slotAt("Mon", startEnd) ??
                    slotAt("Tue", startEnd) ??
                    slotAt("Wed", startEnd) ??
                    slotAt("Thu", startEnd) ??
                    slotAt("Fri", startEnd);
                  const label = ref?.label ?? "";
                  return (
                    <>
                      <Text style={styles.timeSlotLabel}>{label}</Text>
                      <Text style={styles.timeSlotTime}>{startEnd.replace("-", " - ")}</Text>
                    </>
                  );
                })()}
              </View>
              {days.map((d, i) => {
                const slot = slotAt(d, startEnd);
                const style = i === days.length - 1 ? styles.cellLast : styles.cell;
                if (!slot) return <View key={d} style={style} />;
                if (slot.type !== "class") {
                  return (
                    <View key={d} style={style}>
                      <Text style={styles.locked}>{(slot.label ?? slot.type).toUpperCase()}</Text>
                    </View>
                  );
                }
                const entry = entryAt(d, slot.id);
                if (!entry) return <View key={d} style={style} />;
                const subj = state.subjects.find((s) => s.id === entry.subjectId)?.name ?? "?";
                const grade = state.grades.find((g) => g.id === entry.gradeId)?.label ?? "?";
                return (
                  <View key={d} style={style}>
                    <Text style={styles.cellTitle}>{grade}</Text>
                    <Text style={styles.cellSub}>{subj}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {footer ? (
          <Text style={{ marginTop: 10, fontSize: 8, color: "#777" }}>
            Timetable generated:{new Date().toLocaleString()}{"  "}aSc Timetables
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}

