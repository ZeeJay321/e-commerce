'use client';

import { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

import { useDispatch, useSelector } from 'react-redux';

import DetailTable from '@/components/detail-table/detail-table-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';

import { fetchOrderDetail } from '@/redux/slices/detail-slice';
import { AppDispatch, RootState } from '@/redux/store';

import 'antd/dist/reset.css';
import './order-details.css';

const Page = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const {
    products,
    orderInfo,
    loading,
    error
  } = useSelector((state: RootState) => state.orderDetail);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail({ orderId: Number(id) }));
    }
  }, [id, dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const totalAmount = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const netTotalAmount = totalAmount + totalAmount * 0.1;

  return (
    <div className="cover">
      <div className="content-div">
        <div className="page-section">
          <a href="/orders" className="content-paragraph">
            <span className="text-nav-text hover:text-blue-700 transition-colors">
              <ArrowLeftOutlined />
            </span>
            {' '}
            Orders Details
          </a>

          <Divider className="divider-midnight" />

          <div className="order-info-row">
            <div className="order-info-block">
              <span className="order-info-label">Date</span>
              <span className="order-info-value">{orderInfo?.date || 'N/A'}</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Order #</span>
              <span className="order-info-value">{id}</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">User</span>
              <span className="order-info-value">{orderInfo?.fullname}</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Products</span>
              <span className="order-info-value">{products.length}</span>
            </div>

            <div className="order-info-block">
              <span className="order-info-label">Amount</span>
              <span className="order-info-value">
                $
                {netTotalAmount.toFixed(2)}
              </span>
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
