'use client';

import { BellOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Layout, MenuProps } from 'antd';

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
      label: <a href="/logout">Logout</a>
    }
  ];

  return (
    <Header className="navigation-bar">
      {/* Left side */}
      <p className="top-left-nav-tag">E-commerce</p>

      {/* Right side */}
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
          <Dropdown menu={{ items }} placement="bottomLeft" arrow>
            <UserOutlined className="top-icons cursor-pointer" />
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default NavBar;
