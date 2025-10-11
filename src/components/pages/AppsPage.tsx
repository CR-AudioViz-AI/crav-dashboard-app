import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Check, Download } from 'lucide-react';
import { GeoQuickPlugin } from '../plugins/GeoQuickPlugin';
import { FastMathPlugin } from '../plugins/FastMathPlugin';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  costPerUse: number;
  meter: string;
  installed: boolean;
}

export function AppsPage() {
  const [apps, setApps] = useState<App[]>([
    {
      id: 'geo-quick',
      name: 'Geo Quick',
      description: 'Fast-paced geography quiz game. Test your knowledge of world capitals, flags, and landmarks.',
      icon: '🌍',
      costPerUse: 5,
      meter: 'GEO_ROUND',
      installed: false,
    },
    {
      id: 'fast-math',
      name: 'Fast Math',
      description: 'Speed arithmetic challenge game. Improve your mental math skills with timed challenges.',
      icon: '🔢',
      costPerUse: 2,
      meter: 'FAST_MATH_GAME',
      installed: false,
    },
  ]);

  const [openApp, setOpenApp] = useState<string | null>(null);

  const handleInstall = (appId: string) => {
    setApps(apps.map(app =>
      app.id === appId ? { ...app, installed: true } : app
    ));
  };

  const handleUninstall = (appId: string) => {
    setApps(apps.map(app =>
      app.id === appId ? { ...app, installed: false } : app
    ));
    if (openApp === appId) {
      setOpenApp(null);
    }
  };

  const handleOpenApp = (appId: string) => {
    setOpenApp(appId);
  };

  if (openApp === 'geo-quick') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setOpenApp(null)}>
          ← Back to Apps
        </Button>
        <GeoQuickPlugin />
      </div>
    );
  }

  if (openApp === 'fast-math') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setOpenApp(null)}>
          ← Back to Apps
        </Button>
        <FastMathPlugin />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apps</h1>
          <p className="text-gray-600 mt-1">
            Install and manage your CRAV applications
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Apps</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {apps.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.name}
                        </h3>
                        {app.installed && (
                          <Badge variant="success">
                            <Check size={12} className="mr-1" />
                            Installed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {app.description}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Cost: </span>
                          <span className="font-semibold text-gray-900">
                            {app.costPerUse} credits
                          </span>
                          <span className="text-gray-500"> per use</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {app.installed ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleOpenApp(app.id)}
                            >
                              Open App
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUninstall(app.id)}
                            >
                              Uninstall
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleInstall(app.id)}
                          >
                            <Download size={16} className="mr-2" />
                            Install App
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {apps.some(app => app.installed) && (
          <Card>
            <CardHeader>
              <CardTitle>Installed Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apps.filter(app => app.installed).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleOpenApp(app.id)}
                  >
                    <div className="text-2xl">{app.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-600">
                        {app.costPerUse} credits per use
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleOpenApp(app.id);
                    }}>
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
