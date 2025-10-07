'use client';

import {
  useEffect,
  useMemo,
  useState
} from 'react';

import { ArrowsAltOutlined } from '@ant-design/icons';
import {
  Alert,
  Pagination,
  Spin,
  Table
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import OrderDetailsDrawer from '@/components/order-drawer';
import { OrderRow } from '@/models';
import { fetchOrders } from '@/redux/slices/orders-slice';
import { AppDispatch, RootState } from '@/redux/store';

import './order.css';

const OrdersTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items:
    orders,
    total,
    loading,
    loadTable,
    error
  } = useSelector(
    (state: RootState) => state.orders
  );

  const [current, setCurrent] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchOrders({ limit: pageSize, skip: current }));
    setIsRendered(true);
  }, [dispatch, current]);

  const mappedOrders: OrderRow[] = useMemo(
    () => orders.map((order, idx) => ({
      key: idx + 1,
      id: order.id,
      orderNumber: order.orderNumber,
      productsCount: order.productsCount || 0,
      date: order.date,
      amount: order.amount
    })),
    [orders]
  );

  const columns = [
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
      dataIndex: 'productsCount',
      key: 'productsCount',
      render: (count: number) => (
        <span className="table-span">
          {count}
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
      render: (_: unknown, record: OrderRow) => (
        <ArrowsAltOutlined
          className="cursor-pointer hover:text-blue-600 py-4 pl-3"
          onClick={() => {
            setSelectedOrderId(record.orderNumber);
            setDrawerOpen(true);
          }}
        />
      )
    }
  ];

  return (
    <div className="orders-items-div">
      {(loading || !loadTable || !isRendered) && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}

      {!loading
        && !error
        && loadTable
        && (
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

      <OrderDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default OrdersTable;
