'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

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

import { signOut, useSession } from 'next-auth/react';

import './navbar.css';

const { Header } = Layout;

type NavBarProps = {
  authed: boolean;
};

const NavBar = ({ authed }: NavBarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const stored = localStorage.getItem('cartData');
    const parsed = stored ? JSON.parse(stored) : [];
    setCartCount(parsed.length);
  };

  const handleLogout = async () => {
    try {
      const userId = session?.user?.id;

      const cartData = localStorage.getItem('cartData');
      const parsedCart = cartData ? JSON.parse(cartData) : [];

      if (userId) {
        localStorage.setItem(
          `userCartData_${userId}`,
          JSON.stringify(parsedCart)
        );
      }

      localStorage.removeItem('cartData');
      console.log('pathname', pathname);
      await signOut({ redirect: (pathname !== '/'), callbackUrl: '/login' });

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error while saving user cart before logout:', err);
    }
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <a href="/orders">Orders</a>
    },
    {
      key: '2',
      label: (
        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      )
    }
  ];

  return (
    <Header className="navigation-bar">
      <p className="top-left-nav-tag">E-commerce</p>

      <div className="top-right-nav-tag flex items-center gap-4">
        <a href="/cart" className="relative">
          <ShoppingOutlined className="top-icons" />
          {cartCount > 0 && (
            <span className="absolute top-1.5 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1 py-0.25">
              {cartCount}
            </span>
          )}
        </a>

        <a href="/notifications">
          <BellOutlined className="top-icons" />
        </a>

        {!authed ? (
          <a href="/login" className="top-right-text">
            Login
          </a>
        ) : (
          <Dropdown
            menu={{ items }}
            placement="bottomLeft"
            arrow
            trigger={['click']}
          >
            <UserOutlined className="top-icons cursor-pointer" />
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default NavBar;
