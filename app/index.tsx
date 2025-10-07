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
    '/reset-password'
  ];

  const hideNavBar = hideNavBarRoutes.includes(pathname ?? '')
    || pathname?.startsWith('/order-details') || pathname?.startsWith('/admin');

  return (
    <html lang='en'>
      <body>
        <div className='layout-cover'>
          <div className='cover'>
            <Layout className='layout-container'>
              <Provider store={store}>
                {session ? (
                  <>
                    {!hideNavBar && <div className='navbar-fixed'><NavBar authed /></div>}
                    {children}
                  </>
                ) : (
                  <>
                    {!hideNavBar && <div className='navbar-fixed'><NavBar authed={false} /></div>}
                    {children}
                  </>
                )}
              </Provider>
            </Layout>
          </div>
        </div>
      </body>
    </html>
  );
};

export default BaseLayout;
