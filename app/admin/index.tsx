'use client';

import { usePathname } from 'next/navigation';

import { Content } from 'antd/es/layout/layout';

import AdminNavBar from '@/components/admin-navbar/admin-navbar-functionality';
import AdminSidebar from '@/components/side-bar/sider-bar-functionality';

import './admin-layout.css';

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

  // Determine active menu based on pathname
  let activeMenu: 'products' | 'orders' = 'orders'; // default
  if (pathname?.startsWith('/admin/products')) {
    activeMenu = 'products';
  } else if (pathname?.startsWith('/admin/orders')) {
    activeMenu = 'orders';
  }

  return (
    <>
      <div className="admin-sidebar">
        <AdminSidebar active={activeMenu} />
      </div>
      <Content className="admin-content">
        <div className="admin-navbar">
          <AdminNavBar />
        </div>
        {children}
      </Content>
    </>
  );
};

export default BaseLayout;
