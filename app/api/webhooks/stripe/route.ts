import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, webhookRateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await checkRateLimit(webhookRateLimit, 'stripe');
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existingEvent?.processed) {
      return NextResponse.json({ received: true, cached: true });
    }

    const webhookEvent = await prisma.webhookEvent.upsert({
      where: { eventId: event.id },
      create: {
        provider: 'STRIPE',
        eventType: event.type,
        eventId: event.id,
        payload: event as any,
        processed: false,
      },
      update: {},
    });

    try {
      await processStripeEvent(event);

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          error: error.message,
        },
      });
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processStripeEvent(event: any) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orgId = session.metadata?.orgId;
      const userId = session.metadata?.userId;

      if (!orgId) break;

      if (session.mode === 'subscription') {
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planCode = determinePlanCode(stripeSubscription.items.data[0]?.price.id);

        if (!planCode) break;

        const plan = await prisma.plan.findUnique({
          where: { code: planCode },
        });

        if (!plan) break;

        const subscription = await prisma.subscription.create({
          data: {
            orgId,
            planId: plan.id,
            status: 'ACTIVE',
            provider: 'STRIPE',
            externalId: subscriptionId,
            externalCustomerId: customerId,
            periodStart: new Date(stripeSubscription.current_period_start * 1000),
            periodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
        });

        if (plan.includedCredits > 0) {
          const wallet = await prisma.creditWallet.findUnique({
            where: { orgId },
          });

          if (wallet) {
            const newBalance = wallet.balance + plan.includedCredits;
            await prisma.$transaction([
              prisma.creditWallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
              }),
              prisma.creditTransaction.create({
                data: {
                  walletId: wallet.id,
                  type: 'TOPUP',
                  amount: plan.includedCredits,
                  balanceBefore: wallet.balance,
                  balanceAfter: newBalance,
                  description: `${plan.name} plan included credits`,
                  correlationId: session.id,
                },
              }),
            ]);
          }
        }

        await createAuditLog({
          userId,
          orgId,
          action: 'billing.subscription_created',
          target: 'subscription',
          targetId: subscription.id,
          meta: { plan: plan.code, provider: 'STRIPE' },
        });
      }

      if (session.mode === 'payment') {
        const amountTotal = session.amount_total;
        const creditsToAdd = calculateCreditsFromAmount(amountTotal);

        const wallet = await prisma.creditWallet.findUnique({
          where: { orgId },
        });

        if (wallet && creditsToAdd > 0) {
          const newBalance = wallet.balance + creditsToAdd;
          await prisma.$transaction([
            prisma.creditWallet.update({
              where: { id: wallet.id },
              data: { balance: newBalance },
            }),
            prisma.creditTransaction.create({
              data: {
                walletId: wallet.id,
                type: 'TOPUP',
                amount: creditsToAdd,
                balanceBefore: wallet.balance,
                balanceAfter: newBalance,
                description: `Top-up via Stripe`,
                correlationId: session.id,
              },
            }),
          ]);

          await createAuditLog({
            userId,
            orgId,
            action: 'credits.topup',
            target: 'credits',
            targetId: wallet.id,
            meta: { amount: creditsToAdd, provider: 'STRIPE' },
          });
        }
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const subscription = await prisma.subscription.findFirst({
        where: {
          externalCustomerId: customerId,
          provider: 'STRIPE',
        },
        include: { organization: true },
      });

      if (!subscription) break;

      await prisma.invoice.create({
        data: {
          orgId: subscription.orgId,
          amountUsd: Math.round(invoice.amount_paid / 100),
          description: invoice.description || 'Stripe payment',
          provider: 'STRIPE',
          externalId: invoice.id,
          paidAt: new Date(invoice.status_transitions.paid_at * 1000),
          invoiceUrl: invoice.hosted_invoice_url,
          receiptUrl: invoice.invoice_pdf,
          status: 'paid',
        },
      });

      await createAuditLog({
        orgId: subscription.orgId,
        action: 'billing.payment_succeeded',
        target: 'invoice',
        targetId: invoice.id,
        meta: { amount: invoice.amount_paid, provider: 'STRIPE' },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const stripeSubscription = event.data.object;

      const subscription = await prisma.subscription.findFirst({
        where: {
          externalId: stripeSubscription.id,
          provider: 'STRIPE',
        },
      });

      if (!subscription) break;

      const statusMap: Record<string, any> = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELED',
        trialing: 'TRIALING',
        paused: 'PAUSED',
      };

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: statusMap[stripeSubscription.status] || subscription.status,
          periodStart: new Date(stripeSubscription.current_period_start * 1000),
          periodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });

      await createAuditLog({
        orgId: subscription.orgId,
        action: 'billing.subscription_updated',
        target: 'subscription',
        targetId: subscription.id,
        meta: { status: stripeSubscription.status, provider: 'STRIPE' },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSubscription = event.data.object;

      const subscription = await prisma.subscription.findFirst({
        where: {
          externalId: stripeSubscription.id,
          provider: 'STRIPE',
        },
      });

      if (!subscription) break;

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED' },
      });

      await createAuditLog({
        orgId: subscription.orgId,
        action: 'billing.subscription_canceled',
        target: 'subscription',
        targetId: subscription.id,
        meta: { provider: 'STRIPE' },
      });
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const customerId = charge.customer;

      const subscription = await prisma.subscription.findFirst({
        where: {
          externalCustomerId: customerId,
          provider: 'STRIPE',
        },
      });

      if (!subscription) break;

      const refundAmount = Math.round(charge.amount_refunded / 100);
      const creditsToDeduct = calculateCreditsFromAmount(charge.amount_refunded);

      const wallet = await prisma.creditWallet.findUnique({
        where: { orgId: subscription.orgId },
      });

      if (wallet && creditsToDeduct > 0) {
        const newBalance = Math.max(0, wallet.balance - creditsToDeduct);
        await prisma.$transaction([
          prisma.creditWallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          }),
          prisma.creditTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'REFUND',
              amount: -creditsToDeduct,
              balanceBefore: wallet.balance,
              balanceAfter: newBalance,
              description: `Refund from Stripe`,
              correlationId: charge.id,
            },
          }),
        ]);

        await createAuditLog({
          orgId: subscription.orgId,
          action: 'credits.refund',
          target: 'credits',
          targetId: wallet.id,
          meta: { amount: creditsToDeduct, provider: 'STRIPE' },
        });
      }
      break;
    }
  }
}

function determinePlanCode(priceId: string): 'STARTER' | 'PRO' | 'SCALE' | null {
  if (priceId.includes('starter')) return 'STARTER';
  if (priceId.includes('pro')) return 'PRO';
  if (priceId.includes('scale')) return 'SCALE';
  return null;
}

function calculateCreditsFromAmount(amountInCents: number): number {
  const dollars = amountInCents / 100;
  return Math.floor(dollars * 100);
}
