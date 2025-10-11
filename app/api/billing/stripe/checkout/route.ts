import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await requirePermission('billing:manage');
    const body = await req.json();
    const { priceId, mode } = body;

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: 'priceId and mode are required' },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    let subscription = await prisma.subscription.findFirst({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    let customerId = subscription?.externalCustomerId;

    if (!customerId && user?.email) {
      const customer = await createStripeCustomer(user.email, user.name || undefined);
      customerId = customer.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Could not create Stripe customer' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';
    const session = await createCheckoutSession({
      customerId,
      priceId,
      mode: mode as 'subscription' | 'payment',
      successUrl: `${baseUrl}/billing?success=true`,
      cancelUrl: `${baseUrl}/billing?canceled=true`,
      metadata: {
        orgId,
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
