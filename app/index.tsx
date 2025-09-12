'use client';

import { usePathname } from 'next/navigation';

import { Provider } from 'react-redux';

import { Layout } from 'antd';

import 'antd/dist/reset.css';
import './globals.css';

import { useSession } from 'next-auth/react';

import { store } from '@/store/store';

import NavBar from '@/components/navbar/navbarfunctionality';

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
    '/forgotpassword',
    '/resetpassword',
    '/orders'
  ];
  const hideNavBar = hideNavBarRoutes.includes(pathname ?? '')
    || pathname?.startsWith('/orderdetails');
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
