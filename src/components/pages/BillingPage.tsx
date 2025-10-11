import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../contexts/AppContext';
import { Check, CreditCard, Download } from 'lucide-react';

export function BillingPage() {
  const { context } = useAppContext();

  if (!context) return null;

  const plans = [
    {
      code: 'STARTER',
      name: 'Starter',
      price: 0,
      credits: 0,
      discount: 0,
      features: [
        'Pay as you go',
        'All apps access',
        'Email support',
        'Basic analytics',
      ],
    },
    {
      code: 'PRO',
      name: 'Pro',
      price: 49,
      credits: 5000,
      discount: 15,
      features: [
        '5,000 credits/month',
        '15% discount on usage',
        'All apps access',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
      ],
    },
    {
      code: 'SCALE',
      name: 'Scale',
      price: 199,
      credits: 25000,
      discount: 30,
      features: [
        '25,000 credits/month',
        '30% discount on usage',
        'All apps access',
        '24/7 support',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations',
        'SLA guarantee',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and payment methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-2xl font-bold text-gray-900">{context.plan.name}</p>
              <p className="text-gray-600 mt-1">
                ${context.plan.monthlyUsd / 100}/month
              </p>
              {context.plan.discountPct > 0 && (
                <Badge variant="success" className="mt-2">
                  {context.plan.discountPct}% discount on usage
                </Badge>
              )}
            </div>
            <Button variant="secondary">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.code} className={plan.code === context.plan.code ? 'ring-2 ring-blue-500' : ''}>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {plan.credits > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {plan.credits.toLocaleString()} credits included
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.code === context.plan.code ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="primary" className="w-full">
                    {plan.price > (context.plan.monthlyUsd / 100) ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Methods</CardTitle>
          <Button variant="ghost" size="sm">
            <CreditCard size={16} className="mr-2" />
            Add Payment Method
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No payment methods on file
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button variant="ghost" size="sm">
            <Download size={16} className="mr-2" />
            Download All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No invoices yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
