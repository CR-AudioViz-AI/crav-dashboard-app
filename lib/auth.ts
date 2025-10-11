import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || 'noreply@craudiovizai.com',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;

        const memberships = await prisma.membership.findMany({
          where: { userId: token.sub! },
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

        if (memberships.length > 0) {
          const primaryMembership = memberships[0];
          (session.user as any).orgId = primaryMembership.orgId;
          (session.user as any).role = primaryMembership.role;
          (session.user as any).organization = primaryMembership.organization;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        const org = await prisma.organization.create({
          data: {
            name: `${user.name || user.email.split('@')[0]}'s Organization`,
            slug: `org-${Date.now()}`,
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
            creditWallet: {
              create: {
                scope: 'ORG',
                balance: 1000,
              },
            },
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            orgId: org.id,
            action: 'auth.signup',
            target: 'user',
            targetId: user.id,
            meta: { email: user.email } as any,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'auth.login',
          target: 'user',
          targetId: user.id,
          meta: { email: user.email } as any,
        },
      });
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const authOptions = authConfig;
