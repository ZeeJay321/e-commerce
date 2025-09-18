'use client';

import { usePathname } from 'next/navigation';

import { Provider } from 'react-redux';

import { Layout } from 'antd';

import { useSession } from 'next-auth/react';

import { Content } from 'antd/es/layout/layout';

import { store } from '@/redux/store';

import AdminNavBar from '@/components/admin-navbar/admin-navbar-functionality';
import NavBar from '@/components/navbar/navbar-functionality';
import AdminSidebar from '@/components/side-bar/sider-bar-functionality';

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

  const adminRoutes = [
    '/admin/login',
    '/admin/home'
  ];

  const isAdminRoute = adminRoutes.some((route) => pathname?.startsWith(route));

  const hideNavBar = hideNavBarRoutes.includes(pathname ?? '')
    || pathname?.startsWith('/order-details');

  return (
    <html lang='en'>
      <body>
        <div className='layout-cover'>
          <div className='cover'>
            <Layout className='layout-container'>
              <Provider store={store}>
                {isAdminRoute ? (
                  <>
                    <AdminSidebar />
                    <Content>
                      <AdminNavBar />
                      {children}
                    </Content>
                  </>
                ) : session ? (
                  <>
                    {!hideNavBar && <NavBar authed />}
                    {children}
                  </>
                ) : (
                  <>
                    {!hideNavBar && <NavBar authed={false} />}
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
