'use client';

import { Layout } from 'antd';
import './admin-navbar.css';

const { Header } = Layout;

const AdminNavBar = () => (
  <Header className="navigation-bar">
    <p className='top-right-nav-tag'>My Name</p>
  </Header>
);

export default AdminNavBar;
