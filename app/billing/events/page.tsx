import { prisma } from "@/lib/prisma";
import ReprocessForm from "./reprocess-form";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Webhook Events</h1>
      <section className="rounded-2xl bg-white shadow p-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">Processed</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id} className="border-t align-top">
                <td className="py-2 pr-4 font-mono">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4">{e.provider}</td>
                <td className="py-2 pr-4">{e.processed ? "✅" : "❌"}</td>
                <td className="py-2 pr-4">
                  {!e.processed && <ReprocessForm id={e.id} />}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-gray-500">No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
