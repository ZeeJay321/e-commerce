'use client';

import BaseLayout from './index';

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <BaseLayout>
    {children}
  </BaseLayout>
);

export default RootLayout;
