'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { ArrowLeftOutlined } from '@ant-design/icons';

import LoadingSpinner from '@/components/loading/loadingspinner';
import OrdersTable from '@/components/order/orderfunctionality';

import 'antd/dist/reset.css';
import './orders.css';

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
        <Link href='/' className="content-paragraph">
          <ArrowLeftOutlined />
          {' '}
          Orders
        </Link>
      </div>
      <OrdersTable />
    </div>
  );
};

export default Page;
