import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'username', type: 'email' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        console.log(credentials);
        if (
          credentials?.email === 'test@example.com'
          && credentials?.password === '123'
        ) {
          console.log('done');
          return { id: '1', name: 'Test User', email: 'test@example.com' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
