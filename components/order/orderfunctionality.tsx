'use client';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import { useRouter } from 'next/navigation';

import { ArrowsAltOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Pagination,
  Spin,
  Table
} from 'antd';
import { useSession } from 'next-auth/react';

import { useDispatch, useSelector } from 'react-redux';

import { fetchOrdersCount, fetchOrdersPaginated } from '@/store/ordersSlice';
import { AppDispatch, RootState } from '@/store/store';
import './order.css';

import { OrderRow } from '@/models';

const OrdersTable = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: orders, total, loading, error
  } = useSelector(
    (state: RootState) => state.orders
  );

  const [current, setCurrent] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (session?.user?.id) {
      const userId = parseInt(session.user.id, 10);
      if (total === 0) {
        dispatch(fetchOrdersCount(userId));
      }
      dispatch(fetchOrdersPaginated({ userId, slice: pageSize, segment: current }));
    }
  }, [
    session,
    dispatch,
    current,
    total
  ]);

  // ✅ Map orders into table rows
  const mappedOrders: OrderRow[] = useMemo(
    () => orders.map((order, idx) => ({
      key: idx + 1,
      id: order.id,
      orderNumber: order.id.toString(),
      products: order.products,
      date: order.date,
      amount: order.amount
    })),
    [orders]
  );

  const columns: TableColumnsType<OrderRow> = [
    {
      title: <span className="table-span-head">Date</span>,
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <span className="table-span">{text}</span>
    },
    {
      title: <span className="table-span-head">Order #</span>,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <span className="table-span">{text}</span>
    },
    {
      title: <span className="table-span-head">Product(s)</span>,
      dataIndex: 'products',
      key: 'products',
      render: (products: { productId: number; quantity: number, price: number }[]) => (
        <span className="table-span">
          {products.length}
          {' '}
          item(s)
        </span>
      )
    },
    {
      title: <span className="table-span-head">Amount</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className="table-span">
          $
          {amount.toFixed(2)}
        </span>
      )
    },
    {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: (_, record) => (
        <ArrowsAltOutlined
          className="cursor-pointer hover:text-blue-600 py-4 pl-3"
          onClick={() => router.push(`/orderdetails/${record.orderNumber}`)}
        />
      )
    }
  ];

  return (
    <div className="orders-items-div">
      {loading && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}
      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {!loading && !error && (
        <>
          <Table<OrderRow>
            columns={columns}
            dataSource={mappedOrders}
            pagination={false}
            bordered
          />
          <div className="orders-footer-div">
            <div>
              <span className="orders-footer-span">
                {total}
                {' '}
                Total Count
              </span>
            </div>
            <div className="orders-footer-pagination">
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={(page) => setCurrent(page)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersTable;
