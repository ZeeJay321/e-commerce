'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowsAltOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Pagination, Table } from 'antd';

import { useSession } from 'next-auth/react';
import './order.css';

interface Order {
  key: number;
  id: number;
  createdAt: string;
  orderNumber: string;
  products: { productId: number; quantity: number }[];
  amount: number;
}

const OrdersTable = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [current, setCurrent] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/getorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user.id ? Number(session.user.id) : 1 })
      });

      const data = await res.json();

      // Transform API response for the table
      const mapped = data.map((order: any, idx: number) => ({
        key: idx + 1,
        id: order.id,
        createdAt: new Date(order.createdAt).toLocaleDateString(),
        orderNumber: order.id.toString(),
        products: order.products, // has product list
        amount: order.amount
      }));

      setOrders(mapped);
    };

    fetchOrders();
  }, []);

  const columns: TableColumnsType<Order> = [
    {
      title: <span className="table-span-head">Date</span>,
      dataIndex: 'createdAt',
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
      render: (products: any[]) => (
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
          onClick={() => {
            router.push(`/orderdetails/${record.orderNumber}`);
          }}
        />
      )
    }
  ];

  const paginatedData = orders.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="orders-items-div">
      <Table<Order>
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        bordered
      />
      <div className="orders-footer-div">
        <div>
          <span className="orders-footer-span">
            {orders.length}
            {' '}
            Total Count
          </span>
        </div>
        <div className="orders-footer-pagination">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={orders.length}
            onChange={(page) => setCurrent(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
