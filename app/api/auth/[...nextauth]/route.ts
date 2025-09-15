import bcrypt from 'bcrypt';
import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
    rememberMe?: boolean;
  }

  interface Session {
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
    rememberMe?: boolean; // add this
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const remember = credentials?.remember;

        const emailLower = credentials.email.toLowerCase();

        // 🔑 Find user by lowercase email
        const user = await prisma.user.findUnique({
          where: { email: emailLower }
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

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
    signIn: '/login' // custom login page
  },
  session: {
    strategy: 'jwt'
    // maxAge: 60 * 60 * 2
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rememberMe = user.rememberMe;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.rememberMe = token.rememberMe;

        if (token.rememberMe) {
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          session.expires = expires.toISOString();
          console.log(session.expires);
        } else {
          const expires = new Date();
          expires.setDate(expires.getDate() + 1);
          session.expires = expires.toISOString();
          console.log(session.expires);
        }
      }
      return session;
    }

  }

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
