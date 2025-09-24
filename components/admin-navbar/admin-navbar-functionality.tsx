'use client';

import { useEffect, useState } from 'react';

import {
  Dropdown,
  Layout,
  MenuProps
} from 'antd';
import { signOut } from 'next-auth/react';
import './admin-navbar.css';

const { Header } = Layout;

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Logout
      </button>
    )
  }
];

const AdminNavBar = () => {
  const [adminName, setAdminName] = useState<string>('Loading...');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch('/api/admin/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error('Failed to fetch admin');
        }

        const data = await res.json();
        setAdminName(data.fullname || 'Unknown');
      } catch (error) {
        console.error(error);
        setAdminName('Not logged in');
      }
    };

    fetchAdmin();
  }, []);

  return (
    <Header className="navigation-bar">
      <Dropdown
        menu={{ items }}
        placement="bottomLeft"
        arrow
        trigger={['click']}
      >
        <p className="top-right-nav-tag cursor-pointer">{adminName}</p>
      </Dropdown>
    </Header>
  );
};

export default AdminNavBar;
