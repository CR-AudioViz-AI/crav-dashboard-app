import Link from 'next/link';
import { ArrowRight, Package, CreditCard, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to CRAV Dashboard</h1>
        <p className="mt-2 text-gray-600">Your unified platform for all CRAV applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Credit Balance</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">1,000</p>
          <p className="text-sm text-gray-500 mt-2">credits available</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">Starter</p>
          <p className="text-sm text-gray-500 mt-2">1,000 credits/month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500">Installed Apps</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">apps installed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/apps"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Browse Apps</h3>
          <p className="mb-4 opacity-90">
            Discover and install apps to extend your dashboard functionality
          </p>
          <div className="flex items-center text-sm font-medium">
            View Marketplace <ArrowRight className="ml-2 w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/dashboard/billing"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Buy Credits</h3>
          <p className="mb-4 opacity-90">
            Purchase additional credits or upgrade your subscription plan
          </p>
          <div className="flex items-center text-sm font-medium">
            View Plans <ArrowRight className="ml-2 w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h3>
        <p className="text-blue-800 mb-4">
          Welcome to your new dashboard! Here are some quick steps to get started:
        </p>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Browse the Apps Marketplace and install your first app</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Check your credit balance and purchase additional credits if needed</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Customize your organization settings and invite team members</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
