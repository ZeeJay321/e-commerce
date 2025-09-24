'use client';

import { SessionProvider } from 'next-auth/react';

import RouteLoader from '@/components/route-loader/route-loader';

import BaseLayout from './index';

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <SessionProvider>
    <BaseLayout>
      <RouteLoader />
      {children}
    </BaseLayout>
  </SessionProvider>
);

export default RootLayout;
