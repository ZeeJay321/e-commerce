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
      title: 'Title',
      dataIndex: 'title',
      render: (text: string, record) => (
        <div className="cart-product-div">
          <img src={record.img} alt={text} className="cart-product-image" />
          <span className="font-display text-xs">{text}</span>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (value) => (
        <span className="font-display text-sm">
          $
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (value) => (
        <span className="font-display text-sm">{value}</span>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      render: (value) => (
        <span className="font-display text-sm">{value}</span>
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
