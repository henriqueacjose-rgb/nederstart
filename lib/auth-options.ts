import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/en/login',
    newUser: '/en/register',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user?.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          displayName: user.displayName,
          uiLocale: user.uiLocale,
          hashedPassword: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
        token.displayName = user.displayName;
        token.uiLocale = user.uiLocale;
      }
      // Allow session updates to propagate
      if (trigger === 'update' && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        if (session.displayName !== undefined) {
          token.displayName = session.displayName;
        }
        if (session.uiLocale !== undefined) {
          token.uiLocale = session.uiLocale;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? '';
        session.user.role = token.role ?? 'learner';
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
        session.user.displayName = token.displayName ?? null;
        session.user.uiLocale = token.uiLocale ?? 'en';
      }
      return session;
    },
  },
};
