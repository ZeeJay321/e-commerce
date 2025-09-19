'use client';

import { useEffect, useState } from 'react';

import { DeleteOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Button,
  Modal,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [reload, setReload] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products, total, loading, error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const deleteProduct = async (deleteId: string | null) => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/products/delete-product/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      console.log(data);

      setIsModalOpen(false);
      setDeleteKey(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log(errorMsg);
    }
  };

  const confirmDelete = () => {
    if (deleteKey !== null) {
      deleteProduct(deleteKey);
    }
    setReload((prev) => !prev);
    setIsModalOpen(false);
    setDeleteKey(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setDeleteKey(null);
  };

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
  }, [dispatch, currentPage, reload]);

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
      render: (record) => (
        <div className="table-div">
          <EditOutlined className="edit-button" />
          <DeleteOutlined
            onClick={() => {
              setDeleteKey(record.id);
              setIsModalOpen(true);
            }}
            className="delete-button"
          />
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
          total,
          onChange: (page) => setCurrentPage(page)
        }}
        bordered
        rowKey="id"
      />
      <Modal
        open={isModalOpen}
        footer={(
          <div className="flex justify-center gap-8">
            <Button className='max-w-20 w-full' onClick={cancelDelete}>
              No
            </Button>
            <Button className='max-w-20 w-full' type="primary" danger onClick={confirmDelete}>
              Yes
            </Button>
          </div>
        )}
        onCancel={cancelDelete}
        centered
      >
        <div className="delete-modal-div">
          <h2 className="delete-modal-title">Remove Product</h2>
          <WarningOutlined className="delete-modal-icon" />
          <p className="delete-modal-text">
            Are you sure you want to delete this item?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDetailTable;
