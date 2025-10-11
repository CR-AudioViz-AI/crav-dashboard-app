import React, { ReactNode } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  LayoutDashboard,
  Grid3x3,
  CreditCard,
  Coins,
  Image,
  Settings,
  Code,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { context, loading } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (loading || !context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'apps', name: 'Apps', icon: Grid3x3 },
    { id: 'credits', name: 'Credits', icon: Coins },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'assets', name: 'Assets', icon: Image },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'developer', name: 'Developer', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">CRAV Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-0">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-40 lg:z-0`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">CRAV</h1>
              <p className="text-sm text-gray-600 mt-1">Unified Dashboard</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {context.user.name?.[0] || context.user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {context.user.name || context.user.email}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {context.org.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Credits</span>
                  <span className="text-lg font-bold text-blue-600">
                    {context.credits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-screen pt-16 lg:pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
