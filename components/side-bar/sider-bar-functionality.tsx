'use client';

import { useRouter } from 'next/navigation';

import { AppstoreOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import 'antd/dist/reset.css';
import { signOut } from 'next-auth/react';

import './side-bar.css';

const { Sider } = Layout;

type AdminSidebarProps = {
  active?: 'products' | 'orders';
};

const AdminSidebar = ({ active }: AdminSidebarProps) => {
  const router = useRouter();

  return (
    <Sider className="sidebar-background">
      <div className="sidebar-div">
        {/* Title */}
        <h2 className="sidebar-text">E-commerce</h2>

        {/* Buttons */}
        <div className="sidebar-main-div">
          <div className="sidebar-buttons">
            <Button
              type={active === 'products' ? 'primary' : 'default'}
              block
              className="sidebar-button"
              onClick={() => router.push('/admin/products')}
            >
              <AppstoreOutlined />
              <span className="sider-button-span">Products</span>
            </Button>

            <Button
              type={active === 'orders' ? 'primary' : 'default'}
              block
              className="sidebar-button"
              onClick={() => router.push('/admin/orders')}
            >
              <CodeSandboxOutlined />
              <span className="sider-button-span">Orders</span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="sidebar-span-div"
          >
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block"
            >
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            </svg>

            {/* Text */}
            <span className="sider-button-span">Logout</span>
          </button>
        </div>
      </div>
    </Sider>
  );
};

export default AdminSidebar;
