import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { createCustomerPortalSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await requirePermission('billing:manage');

    const subscription = await prisma.subscription.findFirst({
      where: { orgId, provider: 'STRIPE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription?.externalCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';
    const portalSession = await createCustomerPortalSession(
      subscription.externalCustomerId,
      `${baseUrl}/billing`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
