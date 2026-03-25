"use client";

import { PageTitle, Button } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { seedState } from "@/state/seed";
import { DataManagementCard } from "@/app/settings/DataManagementCard";

export default function SettingsPage() {
  const { state, dispatch } = useAppState();

  return (
    <div className="max-w-3xl">
      <PageTitle title="Settings" subtitle="Rules and timetable structure" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="text-sm font-semibold">Rules</div>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.rules.enforceFridayShortDay}
              onChange={(e) =>
                dispatch({
                  type: "rules.update",
                  rules: { enforceFridayShortDay: e.target.checked },
                })
              }
            />
            <span>Enforce Friday short day (via locked slots)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={state.rules.enforceFreeSlotPerDay}
              onChange={(e) =>
                dispatch({
                  type: "rules.update",
                  rules: { enforceFreeSlotPerDay: e.target.checked },
                })
              }
            />
            <span>Enforce one free slot per day per grade (later)</span>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="text-sm font-semibold">Time slots</div>
        <div className="mt-2 text-sm text-zinc-400">
          MVP uses a seeded template. Full editing UI can be added next.
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              const next = seedState();
              dispatch({ type: "timeslots.set", timeSlots: next.timeSlots });
            }}
          >
            Reset time slots to default template
          </Button>
        </div>
      </div>

      <DataManagementCard />
    </div>
  );
}

