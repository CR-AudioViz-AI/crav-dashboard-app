import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { TrendingUp, Zap, Users, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { context } = useAppContext();

  if (!context) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {context.user.name || context.user.email.split('@')[0]}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your account today
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {context.credits.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="text-blue-600" size={24} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => onNavigate('credits')}
            >
              View Ledger <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {context.plan.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => onNavigate('billing')}
            >
              Manage Plan <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => onNavigate('settings')}
            >
              Invite Members <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="primary"
              className="w-full justify-between"
              onClick={() => onNavigate('apps')}
            >
              <span>Browse Apps</span>
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={() => onNavigate('credits')}
            >
              <span>Top Up Credits</span>
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={() => onNavigate('developer')}
            >
              <span>Publish an App</span>
              <ArrowRight size={18} />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Account created</span>
                <span className="text-gray-400 ml-auto">Just now</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">1,000 bonus credits added</span>
                <span className="text-gray-400 ml-auto">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Apps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Geo Quick</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fast-paced geography quiz game
                  </p>
                  <p className="text-xs text-gray-500 mt-2">5 credits per round</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🌍
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => onNavigate('apps')}
              >
                Install
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Fast Math</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Speed arithmetic challenge game
                  </p>
                  <p className="text-xs text-gray-500 mt-2">2 credits per game</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  🔢
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => onNavigate('apps')}
              >
                Install
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
