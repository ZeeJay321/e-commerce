'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeftOutlined } from '@ant-design/icons';

import { Divider } from 'antd';

import DetailTable from '@/components/detailtable/detailtablefunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';

import 'antd/dist/reset.css';
import './orderdetails.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setIsRendered(true);
    console.log('Order ID:', id);
  }, [id]);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      <div className="content-div">
        <div className="page-section">
          <a href="/orders" className="content-paragraph">
            <span className='text-nav-text'><ArrowLeftOutlined /></span>
            {' '}
            Orders Details
          </a>

          <Divider className="divider-midnight" />

          <div className="order-info-row">
            <div className="order-info-block">
              <span className="order-info-label">Date</span>
              <span className="order-info-value">23 March 2024</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Order #</span>
              <span className="order-info-value">{id}</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">User</span>
              <span className="order-info-value">Jackson Smith</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Products</span>
              <span className="order-info-value">03</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Amount</span>
              <span className="order-info-value">$00.00</span>
            </div>
          </div>

          <Divider className="divider-large" />

          <p className="section-title">Product Information</p>
        </div>
      </div>

      <DetailTable />
    </div>
  );
};

export default Page;
