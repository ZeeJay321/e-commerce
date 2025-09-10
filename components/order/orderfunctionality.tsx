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
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Product(s)',
      dataIndex: 'products',
      key: 'products'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <ArrowsAltOutlined
          className="cursor-pointer hover:text-blue-600"
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
