import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../contexts/AppContext';
import { CreditsService } from '../../services/credits';
import { CreditTransaction } from '../../types';
import { Plus, Download, TrendingUp, TrendingDown } from 'lucide-react';

export function CreditsPage() {
  const { context } = useAppContext();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await CreditsService.getLedger(50);
    setTransactions(data);
    setLoading(false);
  };

  const handleTopUp = async () => {
    const amount = parseInt(prompt('Enter amount to top up:') || '0');
    if (amount > 0) {
      await CreditsService.topUp(amount);
      await loadTransactions();
      window.location.reload();
    }
  };

  if (!context) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TOPUP':
      case 'BONUS':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'SPEND':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'REFUND':
        return <TrendingUp className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'TOPUP':
      case 'BONUS':
      case 'REFUND':
        return 'text-green-600';
      case 'SPEND':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
          <p className="text-gray-600 mt-1">
            Manage your credit balance and view transaction history
          </p>
        </div>
        <Button variant="primary" onClick={handleTopUp}>
          <Plus size={18} className="mr-2" />
          Top Up Credits
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Current Balance</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {context.credits.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">credits available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {context.plan.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {context.plan.discountPct}% discount on usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">Pricing</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Geo Round:</span>
                <span className="font-medium">5 credits</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Math Game:</span>
                <span className="font-medium">2 credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="ghost" size="sm">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        txn.type === 'SPEND' ? 'danger' :
                        txn.type === 'TOPUP' || txn.type === 'BONUS' ? 'success' :
                        'default'
                      }>
                        {txn.type}
                      </Badge>
                      {txn.meter && (
                        <span className="text-sm text-gray-600">
                          {txn.meter.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {txn.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(txn.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getTransactionColor(txn.type)}`}>
                      {txn.type === 'SPEND' ? '-' : '+'}{Math.abs(txn.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: {txn.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
