'use client';

import { SessionProvider } from 'next-auth/react';

import BaseLayout from './index';

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <SessionProvider refetchInterval={60 * 60 * 24}>
    <BaseLayout>
      {children}
    </BaseLayout>
  </SessionProvider>
);

export default RootLayout;
