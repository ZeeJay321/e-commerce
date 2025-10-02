import {
  DefaultSession,
  DefaultUser,
  NextAuthOptions
} from 'next-auth';
import { decode as jwtDecode, encode as jwtEncode } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import { createGoogleUser } from '@/helper/google-helper';
import { findUserByEmail, validateUserPassword } from '@/helper/login-checker';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
    rememberMe?: boolean;
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role?: string;
      rememberMe?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    rememberMe?: boolean;
    accessToken?: string;
    exp?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.DRIVE_ID!,
      clientSecret: process.env.DRIVE_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.readonly'
        }
      }
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const remember = credentials.remember === 'true';

        const user = await findUserByEmail(credentials.email);

        if (!user) throw new Error('No user found');

        const isValid = await validateUserPassword(user, credentials.password);
        if (!isValid) throw new Error('Invalid password');

        return {
          id: user.id.toString(),
          name: user.fullname,
          email: user.email,
          role: user.role,
          rememberMe: remember
        };
      }
    })
  ],

  pages: {
    signIn: '/login'
  },

  session: {
    strategy: 'jwt'
    // maxAge: 10
  },
  jwt: {
    async encode({ token, secret, maxAge }) {
      if (!token) return '';

      const newMaxAge = token.exp
        ? token.exp - Math.floor(Date.now() / 1000)
        : maxAge;

      return jwtEncode({ token, secret, maxAge: newMaxAge });
    },
    async decode({ token, secret }) {
      return jwtDecode({ token, secret });
    }
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          let dbUser = await findUserByEmail(user.email!);

          if (!dbUser) {
            dbUser = await createGoogleUser({
              email: user.email!,
              name: user.name || 'Google User',
              image: user.image
            });
          }

          return true;
        } catch (err) {
          console.error('Google sign-in error:', err);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (user) {
        const dbUser = await findUserByEmail(user.email!);

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.rememberMe = false;
          const maxAge = 30 * 60;
          token.exp = Math.floor(Date.now() / 1000 + maxAge);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.rememberMe = token.rememberMe;
        session.accessToken = token.accessToken as string;
        session.expires = new Date((token.exp as number) * 1000).toISOString();
      }

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
