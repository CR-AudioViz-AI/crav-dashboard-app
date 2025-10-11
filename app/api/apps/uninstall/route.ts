import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';

export async function DELETE(req: NextRequest) {
  try {
    const { orgId, userId } = await requirePermission('apps:uninstall');
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const app = await prisma.app.findUnique({
      where: { appId },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const install = await prisma.appInstall.findUnique({
      where: { orgId_appId: { orgId, appId: app.id } },
    });

    if (!install) {
      return NextResponse.json({ error: 'App not installed' }, { status: 404 });
    }

    await prisma.appInstall.delete({
      where: { id: install.id },
    });

    await createAuditLog({
      userId,
      orgId,
      action: 'app.uninstall',
      target: 'app',
      targetId: app.id,
      meta: { appId: app.appId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('App uninstall error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
