'use client';

import { useEffect } from 'react';

import {
  Divider,
  Drawer,
  Spin
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import DetailTable from '@/components/detail-table/detail-table-functionality';
import { fetchOrderDetail } from '@/redux/slices/orders-slice';
import { AppDispatch, RootState } from '@/redux/store';

import './order-drawer.css';

export interface OrderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
  title?: string;
}

const OrderDetailsDrawer = ({
  open,
  onClose,
  orderId,
  title
}: OrderDetailsDrawerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    orderInfo,
    products,
    detailLoading
  } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetail({ orderId }));
    }
  }, [orderId, dispatch]);

  const totalAmount = products.reduce((acc, item) => acc + item.price * item.quantity, 0) * 1.1;

  return (
    <Drawer
      title={title || `Order Details #${orderId ?? ''}`}
      placement="right"
      onClose={onClose}
      open={open}
      width="65%"
      destroyOnClose
    >
      {detailLoading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        orderInfo && (
          <>
            <div className="order-info-row">
              <div className="order-info-block">
                <span className="order-info-label">Date</span>
                <span className="order-info-value">{orderInfo.date}</span>
              </div>

              <div className="order-info-block">
                <span className="order-info-label">Order #</span>
                <span className="order-info-value">{orderId}</span>
              </div>

              <div className="order-info-block">
                <span className="order-info-label">Products</span>
                <span className="order-info-value">{products.length}</span>
              </div>

              <div className="order-info-block">
                <span className="order-info-label">Amount</span>
                <span className="order-info-value">
                  $
                  {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Divider />
            <p className="section-title">Product Information</p>
            <DetailTable />
          </>
        )
      )}
    </Drawer>
  );
};

export default OrderDetailsDrawer;
