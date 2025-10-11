import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await requirePermission('credits:view');

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const taskType = searchParams.get('taskType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const wallet = await prisma.creditWallet.findUnique({
      where: { orgId },
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const where: any = { walletId: wallet.id };
    if (type) where.type = type;
    if (taskType) where.taskType = taskType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          meter: true,
          app: true,
        },
      }),
      prisma.creditTransaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
      balance: wallet.balance,
    });
  } catch (error: any) {
    console.error('Ledger fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
