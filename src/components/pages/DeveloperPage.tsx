import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Upload, CheckCircle, XCircle, Code, Book } from 'lucide-react';

export function DeveloperPage() {
  const [manifest, setManifest] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(manifest);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!parsed.id) errors.push('Missing required field: id');
      if (!parsed.name) errors.push('Missing required field: name');
      if (!parsed.version) errors.push('Missing required field: version');
      if (!parsed.taskTypes || parsed.taskTypes.length === 0) {
        warnings.push('No task types defined');
      }
      if (!parsed.permissions || parsed.permissions.length === 0) {
        warnings.push('No permissions defined');
      }

      setValidation({
        valid: errors.length === 0,
        errors,
        warnings,
      });
    } catch (e) {
      setValidation({
        valid: false,
        errors: ['Invalid JSON format'],
        warnings: [],
      });
    }
  };

  const sampleManifest = {
    id: 'my-app',
    name: 'My App',
    version: '1.0.0',
    scopes: ['org'],
    permissions: ['credits:spend', 'assets:read'],
    taskTypes: [
      { code: 'MY_TASK', label: 'My Task' }
    ],
    routes: {
      dashboardPanel: '/plugins/my-app/panel',
      settings: '/plugins/my-app/settings'
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Developer Portal</h1>
        <p className="text-gray-600 mt-1">
          Publish and manage your CRAV applications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              App Manifest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload or paste your app manifest JSON
              </label>
              <textarea
                value={manifest}
                onChange={(e) => setManifest(e.target.value)}
                placeholder={JSON.stringify(sampleManifest, null, 2)}
                className="w-full h-64 px-3 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleValidate}
                disabled={!manifest}
              >
                Validate Manifest
              </Button>
              <Button
                variant="secondary"
                onClick={() => setManifest(JSON.stringify(sampleManifest, null, 2))}
              >
                Load Sample
              </Button>
            </div>

            {validation && (
              <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {validation.valid ? (
                    <>
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="font-medium text-green-900">Manifest is valid!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={20} />
                      <span className="font-medium text-red-900">Validation failed</span>
                    </>
                  )}
                </div>

                {validation.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-900">Errors:</p>
                    <ul className="mt-1 space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-900">Warnings:</p>
                    <ul className="mt-1 space-y-1">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-yellow-700">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.valid && (
                  <Button variant="primary" size="sm" className="mt-4">
                    <Upload size={16} className="mr-2" />
                    Publish App
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book size={20} />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Manifest Structure</h4>
              <div className="text-sm text-gray-700 space-y-2 font-mono bg-gray-50 p-3 rounded-lg">
                <div><span className="text-blue-600">id</span>: string <span className="text-gray-500">(required)</span></div>
                <div><span className="text-blue-600">name</span>: string <span className="text-gray-500">(required)</span></div>
                <div><span className="text-blue-600">version</span>: string <span className="text-gray-500">(required)</span></div>
                <div><span className="text-blue-600">scopes</span>: string[]</div>
                <div><span className="text-blue-600">permissions</span>: string[]</div>
                <div><span className="text-blue-600">taskTypes</span>: object[]</div>
                <div><span className="text-blue-600">routes</span>: object</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Badge variant="default">credits:spend</Badge>
                  <span className="text-gray-600">Spend user credits</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Badge variant="default">assets:read</Badge>
                  <span className="text-gray-600">Access org assets</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Badge variant="default">members:read</Badge>
                  <span className="text-gray-600">View team members</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Task Types</h4>
              <p className="text-sm text-gray-600">
                Define chargeable actions in your app. Each task type should have a unique code and a descriptive label.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button variant="ghost" className="w-full">
                <Book size={16} className="mr-2" />
                View Full Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Published Apps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No published apps yet. Validate and publish your first app above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
