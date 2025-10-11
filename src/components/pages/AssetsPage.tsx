import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Upload, Image, FileText, Rss } from 'lucide-react';

export function AssetsPage() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [brandKit, setBrandKit] = useState<string>('');
  const [rssUrl, setRssUrl] = useState<string>('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
        <p className="text-gray-600 mt-1">
          Manage your brand assets shared across all apps
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image size={20} />
              Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoUrl ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <img src={logoUrl} alt="Logo" className="max-h-32 mx-auto" />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600">No logo uploaded</p>
              </div>
            )}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="secondary" className="w-full">
                <Upload size={16} className="mr-2" />
                Upload Logo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Brand Kit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value="#3B82F6"
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value="#10B981"
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Font
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Montserrat</option>
                </select>
              </div>
            </div>
            <Button variant="primary" className="w-full">
              Save Brand Kit
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss size={20} />
            Newsletter RSS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/feed.xml"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Apps can display your latest newsletter content
            </p>
          </div>
          <Button variant="primary">
            Save RSS Feed
          </Button>

          {rssUrl && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900">Latest Newsletter Post</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    This is where your latest RSS content will appear
                  </p>
                  <p className="text-xs text-gray-500 mt-2">2 days ago</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
