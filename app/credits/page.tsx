import { prisma } from "@/lib/prisma";
import LedgerTable from "@/components/ledger/LedgerTable";

export const dynamic = "force-dynamic";

async function getLedgerData(orgId: string) {
  const [wallet] = await prisma.creditWallet.findMany({
    where: { orgId, scope: "ORG" },
    take: 1,
  });
  const txns = await prisma.creditTransaction.findMany({
    where: { walletId: wallet?.id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return { balance: wallet?.balance ?? 0, txns };
}

export default async function CreditsPage() {
  const orgId = "TEST_ORG_ID";
  const { balance, txns } = await getLedgerData(orgId);
  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Credits</h1>
        <div className="text-sm text-gray-600">
          Balance: <span className="font-mono">{balance.toLocaleString()} credits</span>
        </div>
      </header>
      <LedgerTable txns={txns} />
    </main>
  );
}
