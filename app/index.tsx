'use client';

import { usePathname } from 'next/navigation';

import { Provider } from 'react-redux';

import { Layout } from 'antd';

import { useSession } from 'next-auth/react';

import { store } from '@/redux/store';

import NavBar from '@/components/navbar/navbar-functionality';

import 'antd/dist/reset.css';
import './globals.css';

const BaseLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hideNavBarRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/orders'
  ];
  const hideNavBar = hideNavBarRoutes.includes(pathname ?? '')
    || pathname?.startsWith('/order-details');

  return (
    <html lang='en'>
      <body>
        <div className='layout-cover'>
          <div className='cover'>
            <Layout className='layout-container'>
              {session ? (
                <>
                  {!hideNavBar && <NavBar authed />}
                  <Provider store={store}>
                    {children}
                  </Provider>
                </>
              ) : (
                <>
                  {!hideNavBar && <NavBar authed={false} />}
                  <Provider store={store}>
                    {children}
                  </Provider>
                </>
              )}
            </Layout>
          </div>
        </div>
      </body>
    </html>
  );
};

export default BaseLayout;
