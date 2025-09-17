import NextAuth, {
  DefaultSession,
  DefaultUser,
  NextAuthOptions
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

import { findUserByEmailAndRole, validateUserPassword } from '@/helper/login-checker';

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
      id: 'User',
      name: 'User Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const remember = credentials.remember === 'true';
        const user = await findUserByEmailAndRole(credentials.email, 'user');

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
    }),
    CredentialsProvider({
      id: 'Admin',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const remember = credentials.remember === 'true';
        const admin = await findUserByEmailAndRole(credentials.email, 'admin');

        if (!admin) throw new Error('No admin found');
        const isValid = await validateUserPassword(admin, credentials.password);
        if (!isValid) throw new Error('Invalid password');

        return {
          id: admin.id.toString(),
          name: admin.fullname,
          email: admin.email,
          role: admin.role,
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
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.rememberMe = user.rememberMe;

        if (!token.exp) {
          const expires = new Date();
          expires.setDate(expires.getDate() + (user.rememberMe ? 30 : 1));
          token.exp = expires.toISOString();
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.rememberMe = token.rememberMe;
        session.expires = token.exp as string;
      }

      return session;
    }
  }

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
