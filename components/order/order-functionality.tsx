'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import { ArrowsAltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Pagination,
  Spin,
  Table
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import OrderDetailsDrawer from '@/components/order-drawer';
import { OrderRow } from '@/models';
import { fetchOrders, fulfillOrder } from '@/redux/slices/orders-slice';
import { AppDispatch, RootState } from '@/redux/store';

import 'antd/dist/reset.css';
import ConfirmDeleteModal from '../delete-modal/delete-modal';
import CustomNotification from '../notifications/notifications-functionality';
import './order.css';

interface OrdersTableProps {
  admin?: boolean;
  search?: string;
}

const OrdersTable = ({ admin = false, search = '' }: OrdersTableProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: orders,
    total,
    loading,
    loadTable,
    error
  } = useSelector((state: RootState) => state.orders);

  const [current, setCurrent] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const pageSize = admin ? 12 : 8;

  const getUpdatedOrders = useCallback(() => {
    dispatch(fetchOrders({
      limit: pageSize,
      skip: current,
      query: search || ''
    }));
  }, [
    dispatch,
    current,
    pageSize,
    search
  ]);

  useEffect(() => {
    getUpdatedOrders();
    setIsRendered(true);
    window.addEventListener('OrderUpdated', getUpdatedOrders);
    return () => window.removeEventListener('OrderUpdated', getUpdatedOrders);
  }, [
    getUpdatedOrders
  ]);

  // Reset to first page on search change
  useEffect(() => {
    setCurrent(1);
  }, [search]);

  const cancelStatusUpdate = () => {
    setModalOpen(false);
  };

  const confirmStatusUpdate = async () => {
    try {
      if (selectedOrderId === null) return;

      const res = await dispatch(
        fulfillOrder({ orderId: selectedOrderId })
      ).unwrap();

      if (res) {
        setNotification({
          type: 'success',
          message: 'Product Shipped successfully'
        });
        setTimeout(() => setNotification(null), 3000);
        window.dispatchEvent(new Event('ProductUpdated'));
      }
    } catch (err) {
      const errMessage = (err as string) || '';
      setNotification({
        type: 'error',
        message: 'Operation Failed',
        description:
          errMessage || 'Something went wrong while Shipping the product.'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setModalOpen(false);
      window.dispatchEvent(new Event('OrderUpdated'));
    }
  };

  // Map order data for the table
  const mappedOrders: (OrderRow & { user?: string })[] = useMemo(
    () => orders.map((order, idx) => ({
      key: idx + 1,
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.user ?? 'Unknown',
      productsCount: order.productsCount || 0,
      date: order.date,
      orderStatus: order.orderStatus,
      amount: order.amount
    })),
    [orders]
  );

  // Define columns
  const columns: TableColumnsType<OrderRow & { user?: string }> = [
    {
      title: <span className="table-span-head">Date</span>,
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <span className="table-span">{text}</span>
    }, {
      title: <span className="table-span-head">Order #</span>,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <span className="table-span">{text}</span>
    },
    ...(admin
      ? [
        {
          title: <span className="table-span-head">User</span>,
          dataIndex: 'user',
          key: 'user',
          render: (text: string) => (
            <div className="flex flex-col">
              <span className="table-span">{text}</span>
            </div>
          )
        }
      ]
      : []),
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
      title: <span className="table-span-head">Status</span>,
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (orderStatus: string) => (
        <span className="table-span">
          {orderStatus}
        </span>
      )
    }, {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: (_, record) => (
        <div>
          <CheckCircleOutlined
            className="table-action-fulfill"
            onClick={() => {
              setSelectedOrderId(record.orderNumber);
              setModalOpen(true);
            }}
          />
          <ArrowsAltOutlined
            className="table-action-open"
            onClick={() => {
              setSelectedOrderId(record.orderNumber);
              setDrawerOpen(true);
            }}
          />
        </div>

      )
    }
  ];

  return (
    <div className="orders-items-div">
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}

      {(loading || !loadTable || !isRendered) && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}

      {!loading && loadTable && (
        <>
          <Table
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

      <ConfirmDeleteModal
        open={modalOpen}
        title="Fulfill Order Status"
        text="Are you sure you want to fulfill this order?"
        onCancel={cancelStatusUpdate}
        onConfirm={confirmStatusUpdate}
      />

    </div>
  );
};

export default OrdersTable;
