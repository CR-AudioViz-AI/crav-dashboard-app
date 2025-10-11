import { Role } from '@prisma/client';
import { auth } from './auth';
import { prisma } from './prisma';

export type Permission =
  | 'billing:manage'
  | 'members:invite'
  | 'members:remove'
  | 'apps:install'
  | 'apps:uninstall'
  | 'credits:spend'
  | 'credits:view'
  | 'assets:upload'
  | 'assets:delete'
  | 'settings:update'
  | 'developer:publish'
  | 'org:delete';

const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    'billing:manage',
    'members:invite',
    'members:remove',
    'apps:install',
    'apps:uninstall',
    'credits:spend',
    'credits:view',
    'assets:upload',
    'assets:delete',
    'settings:update',
    'developer:publish',
    'org:delete',
  ],
  ADMIN: [
    'members:invite',
    'members:remove',
    'apps:install',
    'apps:uninstall',
    'credits:spend',
    'credits:view',
    'assets:upload',
    'assets:delete',
    'settings:update',
  ],
  MEMBER: ['apps:install', 'credits:spend', 'credits:view'],
  VIEWER: ['credits:view'],
};

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireOrg() {
  const session = await requireAuth();
  const orgId = (session.user as any).orgId;

  if (!orgId) {
    throw new Error('No organization found');
  }

  return { session, orgId, userId: session.user?.id || '' };
}

export async function requirePermission(permission: Permission) {
  const { session, orgId } = await requireOrg();
  const role = (session.user as any).role as Role;

  if (!rolePermissions[role]?.includes(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return { session, orgId, userId: session.user?.id || '', role };
}

export async function hasPermission(role: Role, permission: Permission): Promise<boolean> {
  return rolePermissions[role]?.includes(permission) || false;
}

export async function getMembershipWithOrg(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: {
      organization: {
        include: {
          creditWallet: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!membership) {
    throw new Error('No organization membership found');
  }

  return membership;
}
