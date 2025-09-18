'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useSession } from 'next-auth/react';

import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';
import CartTable from '@/components/table/table-functionality';

import 'antd/dist/reset.css';
import './cart.css';

import { CartItem } from '@/models';

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [isRendered, setIsRendered] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    setIsRendered(true);
    const updateCart = () => {
      const cartData = localStorage.getItem('cartData');
      if (cartData) {
        const parsed: CartItem[] = JSON.parse(cartData);
        setCartItems(parsed);

        const subtotal = parsed.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        setTotals({ subtotal, tax, total });
      } else {
        setCartItems([]);
        setTotals({ subtotal: 0, tax: 0, total: 0 });
      }
    };

    updateCart();

    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  const handlePlaceOrder = async () => {
    const { total } = totals;
    try {
      const res = await fetch('/api/orders/place-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user.id,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          })),
          amount: total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order placement failed');
      }

      setNotification({
        type: 'success',
        message: 'Awesome, Your order has been placed successfully!'
      });

      localStorage.removeItem('cartData');
      setCartItems([]);
      setTotals({ subtotal: 0, tax: 0, total: 0 });

      setTimeout(() => {
        setNotification(null);
        router.push('/orders');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      setNotification({
        type: 'error',
        message
      });

      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="cover">
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}

      <div className="content-div">
        <Link href="/" className="content-paragraph">
          <ArrowLeftOutlined />
          {' '}
          Your Shopping Bag
        </Link>
      </div>

      <CartTable />

      <div className="totals-div">
        <div>
          <span className="text-sm">
            Sub Total:
            {' '}
            <span className="font-extrabold">
              $
              {totals.subtotal.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="pt-3.5 text-sm">
          <span>
            Tax:
            {' '}
            <span className="font-extrabold">
              $
              {totals.tax.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="pt-3.5 text-sm">
          <span>
            Total:
            {' '}
            <span className="font-extrabold">
              $
              {totals.total.toFixed(2)}
            </span>
          </span>
        </div>

        <div className="pt-6">
          <Button
            className="place-button"
            type="primary"
            size="large"
            block
            onClick={handlePlaceOrder}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
