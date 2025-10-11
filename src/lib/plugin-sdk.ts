import { DashboardContext, SpendRequest, SpendResponse } from '../types';
import { CreditsService } from '../services/credits';

export class PluginSDK {
  constructor(private context: DashboardContext) {}

  get org() {
    return this.context.org;
  }

  get user() {
    return this.context.user;
  }

  get plan() {
    return this.context.plan;
  }

  get credits() {
    return this.context.credits;
  }

  get role() {
    return this.context.role;
  }

  async spend(taskType: string, meta?: Record<string, any>): Promise<SpendResponse> {
    const request: SpendRequest = { taskType, meta };
    const response = await CreditsService.spend(request);

    if (response.success) {
      this.context.credits = response.balance;
    }

    return response;
  }

  navigate(page: string): void {
    window.dispatchEvent(new CustomEvent('plugin-navigate', { detail: { page } }));
  }

  async getAssets() {
    return {
      logo: null,
      brandKit: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        font: 'Inter',
      },
      newsletter: {
        url: null,
        latestPosts: [],
      },
    };
  }
}

export function createPluginSDK(context: DashboardContext): PluginSDK {
  return new PluginSDK(context);
}
