'use client';

import { Button, Layout } from 'antd';
import 'antd/dist/reset.css';
import './side-bar.css';

const { Sider } = Layout;

const AdminSidebar = () => (
  <Sider className="sidebar-background">
    <div className="sidebar-div">
      {/* Title */}
      <h2 className="sidebar-text">E-commerce</h2>

      {/* Buttons */}
      <div className="sidebar-buttons">
        <Button type="primary" block className="flex items-center gap-2">
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
          Products
        </Button>

        <Button type="default" block className="flex items-center gap-2">
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
          Orders
        </Button>
      </div>
    </div>
  </Sider>
);

export default AdminSidebar;
