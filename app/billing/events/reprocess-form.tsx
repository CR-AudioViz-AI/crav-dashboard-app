"use client";
import { useTransition } from "react";

export default function ReprocessForm({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50"
      disabled={pending}
      onClick={() => start(async () => {
        const res = await fetch("/api/webhooks/reprocess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) alert("Reprocess failed");
        else alert("Reprocessed (if eligible)");
      })}
    >
      {pending ? "Reprocessing..." : "Reprocess"}
    </button>
  );
}
