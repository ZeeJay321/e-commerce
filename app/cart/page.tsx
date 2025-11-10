'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/redux/store';

import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';
import CartTable from '@/components/table/table-functionality';

import 'antd/dist/reset.css';
import './cart.css';

import { CartItem } from '@/models';
import { placeOrder } from '@/redux/slices/orders-slice';

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  const [isRendered, setIsRendered] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [isLoadPage, setIsLoadPage] = useState(false);
  const { loading } = useSelector((state: RootState) => state.orders);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    setIsRendered(true);

    const updateCart = () => {
      const saved = localStorage.getItem('cartData');
      if (saved) {
        setCartItems(JSON.parse(saved));
      } else {
        setCartItems([]);
      }
    };

    updateCart();

    window.addEventListener('cartUpdated', updateCart);

    return () => {
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cartData', JSON.stringify(cartItems));

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    setTotals({ subtotal, tax, total });
  }, [cartItems]);

  if (!isRendered) return <LoadingSpinner />;

  const handlePlaceOrder = async () => {
    if (!session?.user?.id) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to place an order'
      });
      return;
    }

    const invalidItems = cartItems.filter((item) => item.qty > item.stock);

    if (invalidItems.length > 0) {
      const ids = invalidItems.map((i) => i.product).join(', ');
      setNotification({
        type: 'error',
        message: 'Some items exceed available stock',
        description: `Invalid product Name(s): ${ids}`
      });
      return;
    }

    try {
      const response = await dispatch(
        placeOrder({
          userId: session.user.id,
          items: cartItems.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.qty,
            price: item.price
          })),
          amount: totals.total
        })
      ).unwrap();

      setNotification({
        type: 'success',
        message: 'Awesome, Your order has been placed successfully!'
      });

      setIsLoadPage(true);

      localStorage.removeItem('cartData');
      setCartItems([]);
      setTotals({ subtotal: 0, tax: 0, total: 0 });

      setTimeout(() => {
        setNotification(null);
        if (response?.url) {
          window.location.href = response.url;
        } else {
          router.push('/orders');
        }
      }, 2000);
    } catch (err) {
      let errorMessage = 'Order placement failed';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMessage = err.error as string;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setNotification({ type: 'error', message: errorMessage });
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

      {((isLoadPage || loading) && (
        <div className="fixed inset-0 bg-white opacity-40 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ))}

      <div className="content-div">
        <Link href="/" className="content-paragraph">
          <ArrowLeftOutlined />
          {' '}
          Your Shopping Bag
        </Link>
      </div>

      <CartTable cartItems={cartItems} setCartItems={setCartItems} />

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
            Tax (10%):
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
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
