'use client';

import { BellOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Layout } from 'antd';

const { Header } = Layout;

const NavBar = () => (
  <Header className='navigation-bar'>
    <p className='top-left-nav-tag'>
      E-commerce
    </p>
    <div className="top-right-nav-tag">
      <ShoppingOutlined className="top-icons" />
      <BellOutlined className="top-icons" />
      <a href='/login' className="top-right-text">
        Login
      </a>
    </div>
  </Header>
);

export default NavBar;
