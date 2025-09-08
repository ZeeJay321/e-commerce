'use client';

import { ArrowsAltOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Table } from 'antd';
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
  const data: Order[] = Array.from({ length: 10 }, (_, i) => ({
    key: i + 1,
    date: '22 March 2023',
    orderNumber: '45',
    user: '45',
    products: '$00.00',
    amount: '$00.00'
  }));

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
          onClick={() => console.log('Function called', record)}
        />
      )
    }
  ];

  return (
    <div className="cart-items-div">
      <Table<Order>
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8 }}
        bordered
        className=''
      />
    </div>
  );
};

export default OrdersTable;
