'use client';

import { usePathname } from 'next/navigation';

import { Content } from 'antd/es/layout/layout';

import AdminNavBar from '@/components/admin-navbar/admin-navbar-functionality';
import AdminSidebar from '@/components/side-bar/sider-bar-functionality';

const BaseLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();

  const adminAuthRoutes = ['/admin/login'];
  const isAdminAuthRoute = adminAuthRoutes.some((route) => pathname?.startsWith(route));

  if (isAdminAuthRoute) {
    return <Content>{children}</Content>;
  }

  return (
    <>
      <AdminSidebar />
      <Content className=''>
        <AdminNavBar />
        {children}
      </Content>
    </>
  );
};

export default BaseLayout;
