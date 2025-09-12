'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

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
      const res = await fetch('/api/placeorder', {
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

      if (!res.ok) throw new Error('Order placement failed');
      const data = await res.json();
      console.log('✅ Order created:', data);

      setNotif({
        type: 'success',
        message: 'Awesome, Your order has been placed successfully!'
      });

      localStorage.removeItem('cartData');
      setCartItems([]);
      setTotals({ subtotal: 0, tax: 0, total: 0 });

      setTimeout(() => {
        setNotif(null);
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error(error);
      setNotif({
        type: 'error',
        message: 'Something went wrong'
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
        <a href="/" className="content-paragraph">
          <ArrowLeftOutlined />
          {' '}
          Your Shopping Bag
        </a>
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
