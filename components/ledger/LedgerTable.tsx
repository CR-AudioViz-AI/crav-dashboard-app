"use client";
import { useMemo } from "react";
import { exportToCsv } from "@/lib/csv";

type Txn = {
  id: string;
  type: "TOPUP" | "BONUS" | "SPEND" | "REFUND" | "ADJUST";
  amount: number;
  currency: string;
  meta: any | null;
  correlationId: string | null;
  createdAt: string;
};

export default function LedgerTable({ txns }: { txns: Txn[] }) {
  const rows = useMemo(() => {
    let running = 0;
    const copy = [...txns].reverse();
    const withRunning = copy.map((t) => {
      running += t.amount;
      return { ...t, running };
    });
    return withRunning.reverse();
  }, [txns]);

  const onExport = () => {
    exportToCsv(
      "ledger.csv",
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        currency: r.currency,
        createdAt: new Date(r.createdAt).toISOString(),
        correlationId: r.correlationId ?? "",
        meta: r.meta ? JSON.stringify(r.meta) : "",
        runningBalance: r.running,
      }))
    );
  };

  return (
    <section className="rounded-2xl bg-white shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Transaction Ledger</h2>
        <button
          onClick={onExport}
          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Running</th>
              <th className="py-2 pr-4">Correlation</th>
              <th className="py-2 pr-4">Meta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4 font-mono">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{r.type}</td>
                <td className="py-2 pr-4 font-mono">{r.amount}</td>
                <td className="py-2 pr-4 font-mono">{r.running}</td>
                <td className="py-2 pr-4 font-mono">{r.correlationId ?? ""}</td>
                <td className="py-2 pr-4 truncate max-w-[320px]">
                  {r.meta ? JSON.stringify(r.meta) : ""}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
