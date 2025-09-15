'use client';

import type { TableColumnsType } from 'antd';
import { Alert, Spin, Table } from 'antd';
import { useSelector } from 'react-redux';

import { RootState } from '@/store/store';
import './detailtable.css';

interface ProductItem {
  key: number;
  id: number;
  productId: number;
  img: string;
  title: string;
  price: number;
  color: string;
  colorCode: string;
  size: string;
  quantity: number;
  stock: number;
}

const DetailTable = () => {
  const { products, loading, error } = useSelector((state: RootState) => state.orderDetail);

  const columns: TableColumnsType<ProductItem> = [
    {
      title: <span className="table-span-head">Title</span>,
      dataIndex: 'title',
      render: (text: string, record) => (
        <div className="cart-product-div">
          <img src={record.img} alt="" className="cart-product-image" />
          <span className="font-display text-xs whitespace-normal">{text}</span>
        </div>
      )
    },
    {
      title: <span className="table-span-head">Price</span>,
      dataIndex: 'price',
      render: (value: number) => (
        <span className="table-span">
          $
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: <span className="table-span-head">Quantity</span>,
      dataIndex: 'quantity',
      render: (value: number) => <span className="table-span">{value}</span>
    },
    {
      title: <span className="table-span-head">Stock</span>,
      dataIndex: 'stock',
      render: (value: number) => <span className="table-span">{value}</span>
    }
  ];

  if (loading) return <Spin size="large" className="flex justify-center py-10" />;
  if (error) return <Alert type="error" message={error} showIcon className="mb-4" />;

  return (
    <div className="cart-items-div">
      <Table<ProductItem>
        columns={columns}
        dataSource={products}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default DetailTable;
