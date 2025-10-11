import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './components/pages/DashboardPage';
import { AppsPage } from './components/pages/AppsPage';
import { CreditsPage } from './components/pages/CreditsPage';
import { BillingPage } from './components/pages/BillingPage';
import { AssetsPage } from './components/pages/AssetsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { DeveloperPage } from './components/pages/DeveloperPage';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'apps':
        return <AppsPage />;
      case 'credits':
        return <CreditsPage />;
      case 'billing':
        return <BillingPage />;
      case 'assets':
        return <AssetsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'developer':
        return <DeveloperPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AppProvider>
  );
}

export default App;
