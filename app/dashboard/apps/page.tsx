export default function AppsPage() {
  const sampleApps = [
    {
      id: 'geo-quick',
      name: 'Geo Quick',
      description: 'Fast-paced geography quiz game',
      icon: '🌍',
      credits: 5,
      installed: false,
    },
    {
      id: 'fast-math',
      name: 'Fast Math',
      description: 'Speed math challenge game',
      icon: '🧮',
      credits: 3,
      installed: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Apps Marketplace</h1>
        <p className="mt-2 text-gray-600">
          Browse and install apps to extend your dashboard functionality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleApps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{app.icon}</div>
              {app.installed && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Installed
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{app.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{app.credits} credits per play</span>
              <button
                className={`px-4 py-2 rounded text-sm font-medium ${
                  app.installed
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={app.installed}
              >
                {app.installed ? 'Installed' : 'Install'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Want to publish your own app?
        </h3>
        <p className="text-blue-800 mb-4">
          Check out the developer portal to learn how to create and publish your own apps to the
          marketplace.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
          Go to Developer Portal
        </button>
      </div>
    </div>
  );
}
