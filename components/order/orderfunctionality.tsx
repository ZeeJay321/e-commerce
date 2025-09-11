'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ArrowsAltOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Pagination, Table } from 'antd';

import './order.css';

interface Order {
  key: number;
  date: string;
  orderNumber: string;
  user: string;
  products: string;
  amount: string;
}

const OrdersTable = () => {
  const router = useRouter();

  const data: Order[] = Array.from({ length: 10 }, (_, i) => ({
    key: i + 1,
    date: '22 March 2023',
    orderNumber: '45',
    user: '45',
    products: '$00.00',
    amount: '$00.00'
  }));

  const [current, setCurrent] = useState(1);
  const pageSize = 8;

  const columns: TableColumnsType<Order> = [
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
      title: <span className="table-span-head">User</span>,
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => <span className="table-span">{text}</span>
    },
    {
      title: <span className="table-span-head">Product(s)</span>,
      dataIndex: 'products',
      key: 'products',
      render: (text: string) => <span className="table-span">{text}</span>
    },
    {
      title: <span className="table-span-head">Amount</span>,
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string) => <span className="table-span">{text}</span>
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

  const paginatedData = data.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="orders-items-div">
      <Table<Order>
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        bordered
        className=''
      />
      <div className='orders-footer-div'>
        <div>
          <span className='orders-footer-span'>
            {data.length}
            {' '}
            Total Count
          </span>
        </div>
        <div className="orders-footer-pagination">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) => setCurrent(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
