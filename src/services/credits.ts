import { SpendRequest, SpendResponse, CreditTransaction } from '../types';

export class CreditsService {
  private static balance = 1000;

  static async getBalance(): Promise<number> {
    return this.balance;
  }

  static async spend(request: SpendRequest): Promise<SpendResponse> {
    const prices: Record<string, number> = {
      'GEO_ROUND': 5,
      'FAST_MATH_GAME': 2,
    };

    const cost = prices[request.taskType] || 0;

    if (this.balance < cost) {
      return {
        success: false,
        balance: this.balance,
        charged: 0,
        error: 'Insufficient credits',
      };
    }

    this.balance -= cost;

    return {
      success: true,
      balance: this.balance,
      charged: cost,
    };
  }

  static async getLedger(limit = 50): Promise<CreditTransaction[]> {
    return [
      {
        id: '1',
        type: 'BONUS',
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        description: 'Initial bonus credits',
        createdAt: new Date(),
      },
    ];
  }

  static async topUp(amount: number): Promise<void> {
    this.balance += amount;
  }
}
