'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useSession } from 'next-auth/react';

import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality';
import CartTable from '@/components/table/tablefunctionality';

import 'antd/dist/reset.css';
import './cart.css';

interface CartItem {
  img: string;
  id: number;
  product: string;
  colorcode: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession(); // ✅ move hook here

  const [isRendered, setIsRendered] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    setIsRendered(true);

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
    }
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch('/api/orders/placeorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user.id ? Number(session.user.id) : 1,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            price: item.price
          })),
          amount: totals.total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Throw the error message from API
        throw new Error(data.error || 'Order placement failed');
      }

      setNotif({
        type: 'success',
        message: 'Awesome, Your order has been placed successfully!'
      });

      localStorage.removeItem('cartData');
      setCartItems([]);
      setTotals({ subtotal: 0, tax: 0, total: 0 });

      setTimeout(() => {
        setNotif(null);
        router.push('/orders');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      setNotif({
        type: 'error',
        message
      });

      setTimeout(() => setNotif(null), 3000);
    }
  };

  return (
    <div className="cover">
      {notif && (
        <CustomNotification
          type={notif.type}
          message={notif.message}
          description={notif.description}
          placement="topRight"
          onClose={() => setNotif(null)}
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
