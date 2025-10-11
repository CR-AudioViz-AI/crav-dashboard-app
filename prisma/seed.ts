import { PrismaClient, PlanCode, WalletScope, TransactionType, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  console.log('📋 Creating plans...');
  const starterPlan = await prisma.plan.upsert({
    where: { code: PlanCode.STARTER },
    update: {},
    create: {
      code: PlanCode.STARTER,
      name: 'Starter',
      monthlyUsd: 0,
      includedCredits: 0,
      discountPct: 0,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: PlanCode.PRO },
    update: {},
    create: {
      code: PlanCode.PRO,
      name: 'Pro',
      monthlyUsd: 4900,
      includedCredits: 5000,
      discountPct: 15,
    },
  });

  const scalePlan = await prisma.plan.upsert({
    where: { code: PlanCode.SCALE },
    update: {},
    create: {
      code: PlanCode.SCALE,
      name: 'Scale',
      monthlyUsd: 19900,
      includedCredits: 25000,
      discountPct: 30,
    },
  });

  console.log('✅ Plans created');

  console.log('📊 Creating meters...');
  const geoMeter = await prisma.meter.upsert({
    where: { code: 'GEO_ROUND' },
    update: {},
    create: {
      code: 'GEO_ROUND',
      label: 'Geo Quick Round',
      description: 'Cost per geography quiz round',
    },
  });

  const mathMeter = await prisma.meter.upsert({
    where: { code: 'FAST_MATH_GAME' },
    update: {},
    create: {
      code: 'FAST_MATH_GAME',
      label: 'Fast Math Game',
      description: 'Cost per fast math game session',
    },
  });

  console.log('✅ Meters created');

  console.log('💰 Creating price maps...');

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: starterPlan.id, meterId: geoMeter.id } },
    update: {},
    create: {
      planId: starterPlan.id,
      meterId: geoMeter.id,
      credits: 5,
    },
  });

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: proPlan.id, meterId: geoMeter.id } },
    update: {},
    create: {
      planId: proPlan.id,
      meterId: geoMeter.id,
      credits: 5,
    },
  });

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: scalePlan.id, meterId: geoMeter.id } },
    update: {},
    create: {
      planId: scalePlan.id,
      meterId: geoMeter.id,
      credits: 5,
    },
  });

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: starterPlan.id, meterId: mathMeter.id } },
    update: {},
    create: {
      planId: starterPlan.id,
      meterId: mathMeter.id,
      credits: 2,
    },
  });

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: proPlan.id, meterId: mathMeter.id } },
    update: {},
    create: {
      planId: proPlan.id,
      meterId: mathMeter.id,
      credits: 2,
    },
  });

  await prisma.priceMap.upsert({
    where: { planId_meterId: { planId: scalePlan.id, meterId: mathMeter.id } },
    update: {},
    create: {
      planId: scalePlan.id,
      meterId: mathMeter.id,
      credits: 2,
    },
  });

  console.log('✅ Price maps created');

  console.log('🏢 Creating test organization...');

  const testUser = await prisma.user.upsert({
    where: { email: 'test@craudiovizai.com' },
    update: {},
    create: {
      email: 'test@craudiovizai.com',
      name: 'Test User',
    },
  });

  const testOrg = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
    },
  });

  await prisma.membership.upsert({
    where: { orgId_userId: { orgId: testOrg.id, userId: testUser.id } },
    update: {},
    create: {
      orgId: testOrg.id,
      userId: testUser.id,
      role: Role.OWNER,
    },
  });

  const wallet = await prisma.creditWallet.upsert({
    where: { orgId: testOrg.id },
    update: {},
    create: {
      scope: WalletScope.ORG,
      orgId: testOrg.id,
      balance: 1000,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      walletId: wallet.id,
      type: TransactionType.BONUS,
      amount: 1000,
      balanceBefore: 0,
      balanceAfter: 1000,
      description: 'Initial bonus credits',
    },
  });

  console.log('✅ Test organization created with 1,000 bonus credits');

  console.log('🎮 Creating sample apps...');

  const geoApp = await prisma.app.upsert({
    where: { appId: 'geo-quick' },
    update: {},
    create: {
      appId: 'geo-quick',
      name: 'Geo Quick',
      description: 'Fast-paced geography quiz game',
      published: true,
    },
  });

  const geoVersion = await prisma.appVersion.upsert({
    where: { appId_version: { appId: 'geo-quick', version: '1.0.0' } },
    update: {},
    create: {
      appId: 'geo-quick',
      version: '1.0.0',
      published: true,
      manifest: {
        id: 'geo-quick',
        name: 'Geo Quick',
        version: '1.0.0',
        scopes: ['org'],
        permissions: ['credits:spend', 'assets:read'],
        taskTypes: [{ code: 'GEO_ROUND', label: 'Geo Quick Round' }],
        routes: {
          dashboardPanel: '/plugins/geo-quick/panel',
          settings: '/plugins/geo-quick/settings',
        },
      },
    },
  });

  const mathApp = await prisma.app.upsert({
    where: { appId: 'fast-math' },
    update: {},
    create: {
      appId: 'fast-math',
      name: 'Fast Math',
      description: 'Speed arithmetic challenge game',
      published: true,
    },
  });

  const mathVersion = await prisma.appVersion.upsert({
    where: { appId_version: { appId: 'fast-math', version: '1.0.0' } },
    update: {},
    create: {
      appId: 'fast-math',
      version: '1.0.0',
      published: true,
      manifest: {
        id: 'fast-math',
        name: 'Fast Math',
        version: '1.0.0',
        scopes: ['org'],
        permissions: ['credits:spend', 'assets:read'],
        taskTypes: [{ code: 'FAST_MATH_GAME', label: 'Fast Math Game' }],
        routes: {
          dashboardPanel: '/plugins/fast-math/panel',
          settings: '/plugins/fast-math/settings',
        },
      },
    },
  });

  await prisma.appTaskType.upsert({
    where: { appId_code: { appId: 'geo-quick', code: 'GEO_ROUND' } },
    update: {},
    create: {
      appId: 'geo-quick',
      code: 'GEO_ROUND',
      label: 'Geo Quick Round',
      description: 'Play a geography quiz round',
    },
  });

  await prisma.appTaskType.upsert({
    where: { appId_code: { appId: 'fast-math', code: 'FAST_MATH_GAME' } },
    update: {},
    create: {
      appId: 'fast-math',
      code: 'FAST_MATH_GAME',
      label: 'Fast Math Game',
      description: 'Play a fast math challenge',
    },
  });

  console.log('✅ Sample apps created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Plans: 3 (Starter, Pro, Scale)`);
  console.log(`  - Meters: 2 (GEO_ROUND, FAST_MATH_GAME)`);
  console.log(`  - Price Maps: 6`);
  console.log(`  - Test Org: ${testOrg.name} (${testOrg.slug})`);
  console.log(`  - Test User: ${testUser.email}`);
  console.log(`  - Initial Credits: 1,000`);
  console.log(`  - Sample Apps: 2 (Geo Quick, Fast Math)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
