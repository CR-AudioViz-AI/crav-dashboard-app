import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardContext, Role } from '../types';

interface AppContextType {
  context: DashboardContext | null;
  loading: boolean;
  setContext: (ctx: DashboardContext) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<DashboardContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockContext: DashboardContext = {
      org: {
        id: 'test-org-id',
        name: 'Test Organization',
        slug: 'test-org',
        image: null,
      },
      user: {
        id: 'test-user-id',
        email: 'test@craudiovizai.com',
        name: 'Test User',
        image: null,
      },
      plan: {
        id: 'starter-plan-id',
        code: 'STARTER',
        name: 'Starter',
        monthlyUsd: 0,
        includedCredits: 0,
        discountPct: 0,
      },
      credits: 1000,
      role: Role.OWNER,
    };

    setContextState(mockContext);
    setLoading(false);
  }, []);

  const setContext = (ctx: DashboardContext) => {
    setContextState(ctx);
  };

  return (
    <AppContext.Provider value={{ context, loading, setContext }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
