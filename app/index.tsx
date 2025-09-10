'use client';

import { usePathname } from 'next/navigation';

import { Layout } from 'antd';

import 'antd/dist/reset.css';
import './globals.css';

import { useSession } from 'next-auth/react';

import NavBar from '@/components/navbar/navbarfunctionality';

const { Content } = Layout;

const isSignedIn = true;

const BaseLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hideNavBarRoutes = ['/login', '/signup', '/forgotpassword', '/resetpassword', '/orders'];
  const hideNavBar: boolean = hideNavBarRoutes.includes(pathname ?? '');
  return (
    <html lang='en'>
      <body>
        <div className='layout-cover'>
          <div className='cover'>
            <Layout className='layout-container'>
              {session ? (
                <>
                  {!hideNavBar && <NavBar authed />}
                  <Content className='content-section'>
                    {children}
                  </Content>
                </>
              ) : (
                <>
                  {!hideNavBar && <NavBar authed={false} />}
                  <Content className='content-section'>
                    {children}
                  </Content>
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
