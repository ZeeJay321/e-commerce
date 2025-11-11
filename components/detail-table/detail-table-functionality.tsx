'use client';

import type { TableColumnsType } from 'antd';
import {
  Alert,
  Spin,
  Table
} from 'antd';
import { useSelector } from 'react-redux';

import { ProductItem } from '@/models';
import { RootState } from '@/redux/store';

import './detail-table.css';

const DetailTable = () => {
  const {
    products,
    loading,
    error
  } = useSelector((state: RootState) => state.orders);

  const columns: TableColumnsType<ProductItem> = [{
    title: <span className="table-span-head">Title</span>,
    dataIndex: 'title',
    render: (text: string, record) => (
      <div className="cart-product-div">
        <img src={record.img} alt="" className="cart-product-image" />
        <span className="font-display text-xs whitespace-normal">{text}</span>
      </div>
    )
  }, {
    title: <span className="table-span-head">Price / unit</span>,
    dataIndex: 'price',
    render: (value: number) => (
      <span className="table-span">
        $
        {value.toFixed(2)}
      </span>
    )
  }, {
    title: <span className="table-span-head">Quantity</span>,
    dataIndex: 'quantity',
    render: (value: number) => <span className="table-span">{value}</span>
  }, {
    title: <span className="table-span-head">Total Price</span>,
    key: 'total',
    render: (_, record) => (
      <span className="table-span">
        $
        {(record.price * record.quantity).toFixed(2)}
      </span>
    )
  }];

  if (loading) return <Spin size="large" className="flex justify-center py-10" />;

  if (error) return <Alert type="error" message={error} showIcon className="mb-4" />;

  return (
    <div className="cart-items-div">
      <Table<ProductItem>
        columns={columns}
        dataSource={products}
        pagination={false}
        bordered
        scroll={{ x: 'max-content', y: 600 }}
      />
    </div>
  );
};

export default DetailTable;
