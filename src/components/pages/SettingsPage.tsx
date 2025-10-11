import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppContext } from '../../contexts/AppContext';
import { Users, Key, UserPlus } from 'lucide-react';

export function SettingsPage() {
  const { context } = useAppContext();

  if (!context) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your organization settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={context.org.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Slug
            </label>
            <input
              type="text"
              value={context.org.slug}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Used in URLs: craudiovizai.com/{context.org.slug}
            </p>
          </div>
          <Button variant="primary">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Team Members
          </CardTitle>
          <Button variant="ghost" size="sm">
            <UserPlus size={16} className="mr-2" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {context.user.name?.[0] || context.user.email[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {context.user.name || context.user.email}
                </p>
                <p className="text-sm text-gray-600">{context.user.email}</p>
              </div>
              <Badge variant="info">{context.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            API Keys
          </CardTitle>
          <Button variant="ghost" size="sm">
            Generate New Key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No API keys generated yet
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable 2FA</p>
              <p className="text-sm text-gray-600">
                Require two-factor authentication for all members
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">
                Receive notifications for important events
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900">Delete Organization</h4>
            <p className="text-sm text-red-700 mt-1">
              Permanently delete this organization and all associated data. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-3">
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
