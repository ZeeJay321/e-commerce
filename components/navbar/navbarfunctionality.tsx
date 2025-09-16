'use client';

import {
  BellOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Dropdown,
  Layout,
  MenuProps
} from 'antd';
import { signOut } from 'next-auth/react';

import './navbar.css';

const { Header } = Layout;

type NavBarProps = {
  authed: boolean;
};

const NavBar = ({ authed }: NavBarProps) => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <a href="/orders">Orders</a>
    },
    {
      key: '2',
      label: <button type='button' onClick={() => signOut({ callbackUrl: '/' })}>Logout</button>
    }
  ];

  return (
    <Header className="navigation-bar">
      <p className="top-left-nav-tag">E-commerce</p>

      <div className="top-right-nav-tag">
        <a href="/cart">
          <ShoppingOutlined className="top-icons" />
        </a>
        <a href="/notifications">
          <BellOutlined className="top-icons" />
        </a>

        {!authed ? (
          <a href="/login" className="top-right-text">
            Login
          </a>
        ) : (
          <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={['click']}>
            <UserOutlined className="top-icons cursor-pointer" />
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default NavBar;
