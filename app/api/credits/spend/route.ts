import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { checkRateLimit, spendRateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await requirePermission('credits:spend');

    const rateLimitCheck = await checkRateLimit(spendRateLimit, orgId);
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header required', code: 'MISSING_IDEMPOTENCY_KEY' },
        { status: 400 }
      );
    }

    const existingTxn = await prisma.creditTransaction.findFirst({
      where: {
        correlationId: idempotencyKey,
        wallet: { orgId },
      },
    });

    if (existingTxn) {
      const wallet = await prisma.creditWallet.findUnique({
        where: { orgId },
      });
      return NextResponse.json({
        success: true,
        balance: wallet?.balance || 0,
        txnId: existingTxn.id,
        cached: true,
      });
    }

    const body = await req.json();
    const { taskType, meta = {} } = body;

    if (!taskType) {
      return NextResponse.json(
        { error: 'taskType is required', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const meter = await prisma.meter.findUnique({
      where: { code: taskType },
    });

    if (!meter) {
      return NextResponse.json(
        { error: 'Unknown task type', code: 'UNKNOWN_TASK_TYPE' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { orgId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription', code: 'NO_SUBSCRIPTION' },
        { status: 400 }
      );
    }

    const priceMap = await prisma.priceMap.findUnique({
      where: {
        planId_meterId: {
          planId: subscription.planId,
          meterId: meter.id,
        },
      },
    });

    if (!priceMap) {
      return NextResponse.json(
        { error: 'Price not configured for this plan', code: 'PRICE_NOT_CONFIGURED' },
        { status: 400 }
      );
    }

    const creditsToCharge = priceMap.credits;

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.creditWallet.findUnique({
        where: { orgId },
        select: { id: true, balance: true },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < creditsToCharge) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      const newBalance = wallet.balance - creditsToCharge;

      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      const transaction = await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'SPEND',
          amount: -creditsToCharge,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description: `Spent ${creditsToCharge} credits on ${taskType}`,
          meterId: meter.id,
          taskType,
          userId,
          correlationId: idempotencyKey,
        },
      });

      return { transaction, newBalance };
    });

    await createAuditLog({
      userId,
      orgId,
      action: 'credits.spend',
      target: 'credits',
      targetId: result.transaction.id,
      meta: { taskType, amount: creditsToCharge, ...meta },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      balance: result.newBalance,
      txnId: result.transaction.id,
      charged: creditsToCharge,
    });
  } catch (error: any) {
    console.error('Credit spend error:', error);

    if (error.message === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      );
    }

    if (error.message?.includes('Unauthorized') || error.message?.includes('Permission denied')) {
      return NextResponse.json(
        { error: error.message, code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
