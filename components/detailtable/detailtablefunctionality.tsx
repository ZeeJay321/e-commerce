'use client';

import { useEffect, useState } from 'react';

import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

import './detailtable.css';

interface ProductItem {
  key: number;
  img: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
}

const DetailTable = () => {
  const [productData, setProductData] = useState<ProductItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productData');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        key: 1,
        img: '',
        title: 'Cargo Trousers for Men',
        price: 49.99,
        quantity: 2,
        stock: 15
      },
      {
        key: 2,
        img: '',
        title: 'Basic White T-Shirt',
        price: 19.99,
        quantity: 5,
        stock: 30
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('productData', JSON.stringify(productData));
  }, [productData]);

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
      render: (value: number) => (
        <span className="table-span">{value}</span>
      )
    },
    {
      title: <span className="table-span-head">Stock</span>,
      dataIndex: 'stock',
      render: (value: number) => (
        <span className="table-span">{value}</span>
      )
    }
  ];

  return (
    <div className="cart-items-div">
      <Table<ProductItem>
        columns={columns}
        dataSource={productData}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default DetailTable;
