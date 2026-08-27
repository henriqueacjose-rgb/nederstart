import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      onboardingCompleted: boolean;
      displayName: string | null;
      uiLocale: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    onboardingCompleted: boolean;
    displayName: string | null;
    uiLocale: string;
    hashedPassword: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    onboardingCompleted: boolean;
    displayName: string | null;
    uiLocale: string;
  }
}
