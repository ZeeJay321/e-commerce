'use client';

import { Button, Layout } from 'antd';
import 'antd/dist/reset.css';
import { signOut } from 'next-auth/react';
import './side-bar.css';

const { Sider } = Layout;

const AdminSidebar = () => (
  <Sider className="sidebar-background">
    <div className="sidebar-div">
      {/* Title */}
      <h2 className="sidebar-text">E-commerce</h2>

      {/* Buttons */}
      <div className='sidebar-main-div'>
        <div className="sidebar-buttons">
          <Button type="primary" block className="sidebar-button">
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
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span className='sider-button-span'>Products</span>
          </Button>

          <Button type="default" block className="sidebar-button">
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
              <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
              <path d="M12 22V12" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <path d="m7.5 4.27 9 5.15" />
            </svg>
            <span className='sider-button-span'>Orders</span>
          </Button>
        </div>
        <button type='button' onClick={() => signOut({ callbackUrl: '/admin/login' })} className="sidebar-span-div">
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

export default AdminSidebar;
