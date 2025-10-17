'use client';

import { useEffect, useState } from 'react';

import { Dropdown, Layout, MenuProps } from 'antd';
import { signOut, useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const [adminName, setAdminName] = useState<string>('Loading...');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session?.user) {
      setAdminName('Not logged in');
      return;
    }

    setAdminName(session.user.name || 'Admin');
  }, [session, status]);

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
