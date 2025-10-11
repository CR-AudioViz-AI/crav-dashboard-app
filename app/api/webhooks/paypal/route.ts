import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, webhookRateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await checkRateLimit(webhookRateLimit, 'paypal');
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const eventType = body.event_type;
    const eventId = body.id;

    if (!eventId || !eventType) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent?.processed) {
      return NextResponse.json({ received: true, cached: true });
    }

    const webhookEvent = await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        provider: 'PAYPAL',
        eventType,
        eventId,
        payload: body as any,
        processed: false,
      },
      update: {},
    });

    try {
      await processPayPalEvent(body);

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Error processing PayPal webhook:', error);
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { error: error.message },
      });
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processPayPalEvent(event: any) {
  const eventType = event.event_type;
  const resource = event.resource;

  switch (eventType) {
    case 'BILLING.SUBSCRIPTION.CREATED':
    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      const subscriptionId = resource.id;
      const customId = resource.custom_id;

      if (!customId) break;

      const [orgId, planCode] = customId.split(':');
      if (!orgId || !planCode) break;

      const plan = await prisma.plan.findUnique({
        where: { code: planCode as any },
      });

      if (!plan) break;

      await prisma.subscription.create({
        data: {
          orgId,
          planId: plan.id,
          status: 'ACTIVE',
          provider: 'PAYPAL',
          externalId: subscriptionId,
          externalCustomerId: resource.subscriber?.payer_id,
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
                correlationId: subscriptionId,
              },
            }),
          ]);
        }
      }

      await createAuditLog({
        orgId,
        action: 'billing.subscription_created',
        target: 'subscription',
        targetId: subscriptionId,
        meta: { plan: plan.code, provider: 'PAYPAL' },
      });
      break;
    }

    case 'PAYMENT.SALE.COMPLETED': {
      const saleId = resource.id;
      const customId = resource.custom;

      if (!customId) break;

      const [orgId] = customId.split(':');
      if (!orgId) break;

      const amountValue = parseFloat(resource.amount?.total || '0');
      const creditsToAdd = Math.floor(amountValue * 100);

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
              description: 'Top-up via PayPal',
              correlationId: saleId,
            },
          }),
        ]);

        await prisma.invoice.create({
          data: {
            orgId,
            amountUsd: Math.round(amountValue),
            description: 'PayPal payment',
            provider: 'PAYPAL',
            externalId: saleId,
            paidAt: new Date(),
            status: 'paid',
          },
        });

        await createAuditLog({
          orgId,
          action: 'billing.payment_succeeded',
          target: 'invoice',
          targetId: saleId,
          meta: { amount: amountValue, provider: 'PAYPAL' },
        });
      }
      break;
    }

    case 'BILLING.SUBSCRIPTION.CANCELLED': {
      const subscriptionId = resource.id;

      const subscription = await prisma.subscription.findFirst({
        where: {
          externalId: subscriptionId,
          provider: 'PAYPAL',
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
        meta: { provider: 'PAYPAL' },
      });
      break;
    }

    case 'PAYMENT.SALE.REFUNDED': {
      const refundId = resource.id;
      const saleId = resource.sale_id;

      const transaction = await prisma.creditTransaction.findFirst({
        where: { correlationId: saleId },
        include: { wallet: true },
      });

      if (!transaction) break;

      const refundAmount = parseFloat(resource.amount?.total || '0');
      const creditsToDeduct = Math.floor(refundAmount * 100);

      const wallet = transaction.wallet;
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
            description: 'Refund from PayPal',
            correlationId: refundId,
          },
        }),
      ]);

      await createAuditLog({
        orgId: wallet.orgId!,
        action: 'credits.refund',
        target: 'credits',
        targetId: wallet.id,
        meta: { amount: creditsToDeduct, provider: 'PAYPAL' },
      });
      break;
    }
  }
}
