import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await requirePermission('developer:publish');
    const body = await req.json();
    const { manifest } = body;

    if (!manifest || !manifest.id || !manifest.name || !manifest.version) {
      return NextResponse.json({ error: 'Invalid manifest' }, { status: 400 });
    }

    let app = await prisma.app.findUnique({
      where: { appId: manifest.id },
    });

    if (!app) {
      app = await prisma.app.create({
        data: {
          appId: manifest.id,
          name: manifest.name,
          description: manifest.description,
          iconUrl: manifest.iconUrl,
          published: false,
        },
      });

      if (manifest.taskTypes && Array.isArray(manifest.taskTypes)) {
        for (const taskType of manifest.taskTypes) {
          await prisma.appTaskType.create({
            data: {
              appId: app.id,
              code: taskType.code,
              label: taskType.label,
              description: taskType.description,
            },
          });

          const meterExists = await prisma.meter.findUnique({
            where: { code: taskType.code },
          });

          if (!meterExists) {
            await prisma.meter.create({
              data: {
                code: taskType.code,
                label: taskType.label,
                description: taskType.description,
                appId: app.id,
              },
            });
          }
        }
      }

      if (manifest.permissions && Array.isArray(manifest.permissions)) {
        for (const permission of manifest.permissions) {
          await prisma.appPermission.create({
            data: {
              appId: app.id,
              scope: permission.split(':')[0] || 'unknown',
              label: permission,
              required: true,
            },
          });
        }
      }
    }

    const existingVersion = await prisma.appVersion.findUnique({
      where: {
        appId_version: {
          appId: app.id,
          version: manifest.version,
        },
      },
    });

    if (existingVersion) {
      return NextResponse.json({ error: 'Version already exists' }, { status: 409 });
    }

    const appVersion = await prisma.appVersion.create({
      data: {
        appId: app.id,
        version: manifest.version,
        manifest: manifest as any,
        published: true,
      },
    });

    await prisma.app.update({
      where: { id: app.id },
      data: { published: true },
    });

    await createAuditLog({
      userId,
      orgId,
      action: 'app.install',
      target: 'app',
      targetId: app.id,
      meta: { appId: app.appId, version: manifest.version, action: 'publish' },
    });

    return NextResponse.json({
      app,
      version: appVersion,
    });
  } catch (error: any) {
    console.error('App publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
