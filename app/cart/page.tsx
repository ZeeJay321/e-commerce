'use client';

import { useEffect, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality';
import CartTable from '@/components/table/tablefunctionality';

import 'antd/dist/reset.css';
import './cart.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  const handlePlaceOrder = async () => {
    try {
      const success = true;

      if (success) {
        setNotif({
          type: 'success',
          message: 'Awesome, Your order has been placed successfully!'
        });
      } else {
        setNotif({
          type: 'error',
          message: 'Order placement failed'
        });
      }
    } catch (error) {
      setNotif({
        type: 'error',
        message: 'Something went wrong'
      });
    }

    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="cover">
      {/* ✅ Notification */}
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
            <span className="font-extrabold">$0.00</span>
          </span>
        </div>
        <div className="pt-3.5 text-sm">
          <span>
            Tax:
            {' '}
            <span className="font-extrabold">$0.00</span>
          </span>
        </div>
        <div className="pt-3.5 text-sm">
          <span>
            Total:
            {' '}
            <span className="font-extrabold">$0.00</span>
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
