import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const orgId = (session.user as any).orgId;

  if (!orgId) {
    return <div>No organization found</div>;
  }

  const [wallet, subscription, recentTransactions, installedApps] = await Promise.all([
    prisma.creditWallet.findUnique({
      where: { orgId },
    }),
    prisma.subscription.findFirst({
      where: { orgId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creditTransaction.findMany({
      where: { wallet: { orgId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { meter: true, app: true },
    }),
    prisma.appInstall.findMany({
      where: { orgId, enabled: true },
      include: { app: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Credit Balance</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{wallet?.balance || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {subscription?.plan.name || 'Starter'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Installed Apps</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{installedApps.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {txn.description || txn.taskType || txn.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {txn.amount > 0 ? '+' : ''}
                        {txn.amount}
                      </p>
                      <p className="text-sm text-gray-500">Balance: {txn.balanceAfter}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Installed Apps</h2>
          </div>
          <div className="p-6">
            {installedApps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No apps installed yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {installedApps.map((install) => (
                  <div key={install.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{install.app.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {install.app.description || 'No description'}
                    </p>
                    <a
                      href={`/apps/${install.app.appId}`}
                      className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700"
                    >
                      Open app →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
