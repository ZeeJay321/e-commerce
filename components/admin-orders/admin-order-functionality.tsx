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

import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders } from '@/redux/slices/orders-slice';
import { AppDispatch, RootState } from '@/redux/store';

import { OrderRow } from '@/models';
import './admin-order.css';

type AdminOrderRow = OrderRow & { user: string };

const AdminOrdersTable = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: orders,
    total,
    loading,
    error
  } = useSelector((state: RootState) => state.orders);

  const [current, setCurrent] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    dispatch(fetchOrders({
      slice: pageSize,
      segment: current
    }));
  }, [dispatch, current]);

  const mappedOrders: AdminOrderRow[] = useMemo(
    () => orders.map((order, idx) => ({
      key: idx + 1,
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.user ?? 'Unknown',
      products: order.products,
      date: order.date,
      amount: order.amount
    })),
    [orders]
  );

  const columns: TableColumnsType<AdminOrderRow> = [{
    title: <span className="table-span-head">Date</span>,
    dataIndex: 'date',
    key: 'date',
    render: (text: string) => <span className="table-span">{text}</span>
  }, {
    title: <span className="table-span-head">Order #</span>,
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    render: (_: string, record) => (
      <div className="flex flex-col">
        <span className="table-span">{record.orderNumber}</span>
      </div>
    )
  }, {
    title: <span className="table-span-head">User</span>,
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    render: (_: string, record) => (
      <div className="flex flex-col">
        <span className="table-span">{record.user}</span>
      </div>
    )
  }, {
    title: <span className="table-span-head">Product(s)</span>,
    dataIndex: 'products',
    key: 'products',
    render: (products: { productId: number; quantity: number; price: number }[]) => (
      <span className="table-span">
        {products.length}
        {' '}
        item(s)
      </span>
    )
  }, {
    title: <span className="table-span-head">Amount</span>,
    dataIndex: 'amount',
    key: 'amount',
    render: (amount: number) => (
      <span className="table-span">
        $
        {amount.toFixed(2)}
      </span>
    )
  }, {
    title: <span className="table-span-head">Actions</span>,
    key: 'actions',
    render: (_, record) => (
      <ArrowsAltOutlined
        className="cursor-pointer hover:text-blue-600 py-4 pl-3"
        onClick={() => router.push(`/admin/order-details/${record.orderNumber}`)}
      />
    )
  }];

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
          <Table<OrderRow & { user: string }>
            columns={columns}
            dataSource={mappedOrders}
            pagination={false}
            bordered
          />
          <div className="orders-footer-div">
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

export default AdminOrdersTable;
