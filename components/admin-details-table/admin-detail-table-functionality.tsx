'use client';

import { useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Spin,
  Table
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { Product } from '@/models';
import {
  clearProducts,
  fetchProductsWithTotal
} from '@/redux/slices/products-slice';
import { AppDispatch, RootState } from '@/redux/store';

import './admin-detail-table.css';

const AdminDetailTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products, total, loading, error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    dispatch(clearProducts());
    dispatch(
      fetchProductsWithTotal({
        segment: currentPage,
        slice: pageSize,
        query: '',
        sortOption: null
      })
    );
  }, [dispatch, currentPage]);

  const columns: TableColumnsType<Product> = [
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
      title: <span className="table-span-head">Stock</span>,
      dataIndex: 'stock',
      render: (value: number) => (
        <span className="table-span">{value}</span>
      )
    },
    {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: () => (
        <div className="table-div">
          <EditOutlined className="edit-button" />
          <DeleteOutlined className="delete-button" />
        </div>
      )
    }
  ];

  if (loading) {
    return <Spin size="large" className="flex justify-center py-10" />;
  }

  if (error) {
    return <Alert type="error" message={error} showIcon className="mb-4" />;
  }

  return (
    <div className="cart-items-div">
      <Table<Product>
        columns={columns}
        dataSource={products}
        pagination={{
          current: currentPage,
          pageSize,
          total, // ✅ comes from API
          onChange: (page) => setCurrentPage(page)
        }}
        bordered
        rowKey="id"
      />
    </div>
  );
};

export default AdminDetailTable;
