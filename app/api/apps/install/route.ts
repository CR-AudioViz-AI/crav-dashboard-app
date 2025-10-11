import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await requirePermission('apps:install');
    const body = await req.json();
    const { appId, versionId } = body;

    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }

    const app = await prisma.app.findUnique({
      where: { appId },
      include: { versions: { where: { published: true }, orderBy: { createdAt: 'desc' } } },
    });

    if (!app || !app.published) {
      return NextResponse.json({ error: 'App not found or not published' }, { status: 404 });
    }

    const version = versionId
      ? await prisma.appVersion.findUnique({ where: { id: versionId } })
      : app.versions[0];

    if (!version) {
      return NextResponse.json({ error: 'No published version found' }, { status: 404 });
    }

    const existingInstall = await prisma.appInstall.findUnique({
      where: { orgId_appId: { orgId, appId: app.id } },
    });

    if (existingInstall) {
      return NextResponse.json({ error: 'App already installed' }, { status: 409 });
    }

    const install = await prisma.appInstall.create({
      data: {
        orgId,
        appId: app.id,
        versionId: version.id,
        enabled: true,
      },
      include: { app: true, version: true },
    });

    await createAuditLog({
      userId,
      orgId,
      action: 'app.install',
      target: 'app',
      targetId: app.id,
      meta: { appId: app.appId, version: version.version },
    });

    return NextResponse.json({ install });
  } catch (error: any) {
    console.error('App install error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
