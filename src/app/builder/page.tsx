import { Suspense } from "react";
import BuilderClient from "@/app/builder/BuilderClient";

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          Loading builder…
        </div>
      }
    >
      <BuilderClient />
    </Suspense>
  );
}

