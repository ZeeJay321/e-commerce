'use client';

import { useEffect, useState } from 'react';

import { Layout } from 'antd';
import './admin-navbar.css';

const { Header } = Layout;

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
      <p className="top-right-nav-tag">{adminName}</p>
    </Header>
  );
};

export default AdminNavBar;
