"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useAppState } from "@/state/AppStateProvider";
import { exportState } from "@/state/storage";

export function DataManagementCard() {
  const { state, dispatch } = useAppState();
  const [importText, setImportText] = useState("");

  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="text-sm font-semibold">Data management (backup)</div>
      <div className="mt-2 text-sm text-zinc-400">
        Export/import JSON backups (local-only MVP).
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            const json = exportState(state);
            navigator.clipboard?.writeText(json);
            window.alert("Export copied to clipboard.");
          }}
        >
          Copy export JSON
        </Button>
      </div>

      <div className="mt-4">
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste JSON export here to import…"
          className="w-full min-h-[140px] rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
        <div className="mt-3 flex gap-3">
          <Button
            variant="primary"
            onClick={() => {
              try {
                const next = JSON.parse(importText);
                dispatch({ type: "state.import", state: next });
                window.alert("Imported.");
              } catch {
                window.alert("Invalid JSON.");
              }
            }}
          >
            Import JSON
          </Button>
          <Button variant="secondary" onClick={() => setImportText("")}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

