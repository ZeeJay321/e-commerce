'use client';

import { useEffect, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import LoadingSpinner from '@/components/loading/loadingspinner';
import CartTable from '@/components/table/tablefunctionality';

import 'antd/dist/reset.css';
import './cart.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
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
          <Button className='place-button' type="primary" size="large" block>
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
