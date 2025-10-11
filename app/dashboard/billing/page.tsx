export default function BillingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      credits: 1000,
      features: [
        '1,000 credits/month',
        'Access to all apps',
        'Email support',
        'Community access',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: 79,
      credits: 3000,
      features: [
        '3,000 credits/month',
        'Priority app access',
        'Priority support',
        'Advanced analytics',
      ],
      current: false,
    },
    {
      name: 'Scale',
      price: 199,
      credits: 10000,
      features: [
        '10,000 credits/month',
        'Dedicated support',
        'Custom integrations',
        'API access',
      ],
      current: false,
    },
  ];

  const topUpOptions = [
    { credits: 100, price: 9 },
    { credits: 500, price: 39 },
    { credits: 1000, price: 69 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="mt-2 text-gray-600">Manage your subscription and purchase additional credits</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">Starter Plan</p>
            <p className="text-gray-600 mt-1">Next billing date: November 11, 2025</p>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">
            Manage Subscription
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow p-6 ${
                plan.current ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'
              }`}
            >
              {plan.current && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded mb-4">
                  Current Plan
                </span>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full px-4 py-2 rounded text-sm font-medium ${
                  plan.current
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buy Additional Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topUpOptions.map((option) => (
            <div key={option.credits} className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-900">{option.credits}</p>
                <p className="text-gray-600 mt-1">credits</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-gray-900">${option.price}</span>
              </div>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h3>
        <p className="text-gray-600 mb-4">Manage your payment methods and billing information</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
          Manage Payment Methods
        </button>
      </div>
    </div>
  );
}
