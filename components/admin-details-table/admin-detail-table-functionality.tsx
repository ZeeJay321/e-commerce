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
  deleteProduct,
  fetchProducts,
  updateProduct
} from '@/redux/slices/products-slice';
import { AppDispatch, RootState } from '@/redux/store';

import EditProductModal from '@/components/admin-modal/admin-modal';

import ConfirmDeleteModal from '../delete-modal/delete-modal';
import './admin-detail-table.css';

const AdminDetailTable = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [reload, setReload] = useState(false);

  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products, total, loading, error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const handleDeleteProduct = (deleteId: string | null) => {
    if (!deleteId) return;
    dispatch(deleteProduct(deleteId));
  };

  const confirmDelete = () => {
    if (deleteKey !== null) {
      handleDeleteProduct(deleteKey);
    }
    setReload((prev) => !prev);
    setIsDeleteModalOpen(false);
    setDeleteKey(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteKey(null);
  };

  useEffect(() => {
    dispatch(clearProducts());
    dispatch(
      fetchProducts({
        skip: currentPage,
        limit: pageSize,
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
          <EditOutlined
            className="edit-button"
            onClick={() => setEditProduct(record)}
          />
          <DeleteOutlined
            onClick={() => {
              setDeleteKey(record.id);
              setIsDeleteModalOpen(true);
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        title="Remove Product"
        text="Are you sure you want to delete this item?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      {editProduct && (
        <EditProductModal
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          product={{
            id: editProduct.id,
            name: editProduct.title,
            price: editProduct.price,
            quantity: editProduct.stock,
            image: editProduct.img,
            color: editProduct.color,
            colorCode: editProduct.colorCode,
            size: editProduct.size
          }}
          showImage
          title="Edit a Single Product"
          actionLabel="Update"
          onAction={async (formData) => {
            await dispatch(updateProduct({ id: editProduct.id, formData }));
            setEditProduct(null); // close modal after success
          }}
        />
      )}
    </div>
  );
};

export default AdminDetailTable;
