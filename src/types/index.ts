import { Role, PlanCode, TransactionType, AssetKind } from '@prisma/client';

export { Role, PlanCode, TransactionType, AssetKind };

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface Membership {
  id: string;
  role: Role;
  organization: Organization;
  user: User;
}

export interface Plan {
  id: string;
  code: PlanCode;
  name: string;
  monthlyUsd: number;
  includedCredits: number;
  discountPct: number;
}

export interface CreditWallet {
  id: string;
  balance: number;
}

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;
  meter?: { code: string; label: string };
  app?: { name: string };
}

export interface App {
  id: string;
  appId: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  published: boolean;
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  scopes: string[];
  permissions: string[];
  taskTypes: Array<{ code: string; label: string }>;
  routes: {
    dashboardPanel: string;
    settings?: string;
  };
}

export interface AppInstall {
  id: string;
  orgId: string;
  appId: string;
  enabled: boolean;
  app: App;
  version: {
    version: string;
    manifest: AppManifest;
  };
}

export interface DashboardContext {
  org: Organization;
  user: User;
  plan: Plan;
  credits: number;
  role: Role;
}

export interface SpendRequest {
  taskType: string;
  meta?: Record<string, any>;
}

export interface SpendResponse {
  success: boolean;
  balance: number;
  charged: number;
  error?: string;
}
