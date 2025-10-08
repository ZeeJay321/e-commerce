'use client';

import {
  useCallback, useEffect, useMemo, useState
} from 'react';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Alert, Spin, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import EditProductModal from '@/components/admin-modal/admin-modal';
import {
  clearProducts,
  deleteProduct,
  fetchProducts,
  updateProduct
} from '@/redux/slices/products-slice';
import { AppDispatch, RootState } from '@/redux/store';

import ConfirmDeleteModal from '../delete-modal/delete-modal';

import './admin-detail-table.css';

const AdminDetailTable = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [reload, setReload] = useState(false);
  const [editVariant, setEditVariant] = useState<any | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products,
    total,
    loading,
    error
  } = useSelector((state: RootState) => state.products);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  /** Fetch products with variants */
  const getUpdatedProducts = useCallback(() => {
    dispatch(clearProducts());
    dispatch(
      fetchProducts({
        skip: currentPage,
        limit: pageSize,
        query: '',
        sortOption: null
      })
    );
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    getUpdatedProducts();
    window.addEventListener('ProductUpdated', getUpdatedProducts);
    return () => window.removeEventListener('ProductUpdated', getUpdatedProducts);
  }, [getUpdatedProducts, reload]);

  /** Flatten all variants into table rows */
  const variantRows = useMemo(() => {
    if (!products?.length) return [];
    return products.flatMap((product) => product.variants.map((variant: any) => ({
      key: variant.id,
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      img: product.img,
      color: variant.color,
      colorCode: variant.colorCode,
      size: variant.size,
      price: variant.price,
      stock: variant.stock
    })));
  }, [products]);

  const handleDeleteVariant = (variantId: string | null) => {
    if (!variantId) return;
    dispatch(deleteProduct(variantId));
  };

  const confirmDelete = () => {
    if (deleteKey !== null) {
      handleDeleteVariant(deleteKey);
    }
    setReload((prev) => !prev);
    setIsDeleteModalOpen(false);
    setDeleteKey(null);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteKey(null);
  };

  const columns: TableColumnsType<any> = [
    {
      title: <span className="table-span-head">Product</span>,
      dataIndex: 'title',
      render: (text: string, record) => (
        <div className="cart-product-div">
          <img src={record.img} alt="" className="cart-product-image" />
          <span className="font-display text-xs whitespace-normal">{text}</span>
        </div>
      )
    },
    {
      title: <span className="table-span-head">Color</span>,
      dataIndex: 'color',
      render: (color: string, record) => (
        <div className="flex items-center gap-2">
          <span className="table-span">{color}</span>
          {record.colorCode && (
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: record.colorCode }}
            />
          )}
        </div>
      )
    },
    {
      title: <span className="table-span-head">Size</span>,
      dataIndex: 'size',
      render: (value: string) => <span className="table-span">{value}</span>
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
      render: (value: number) => <span className="table-span">{value}</span>
    },
    {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: (record) => (
        <div className="table-div">
          <EditOutlined
            className="edit-button"
            onClick={() => setEditVariant(record)}
          />
          <DeleteOutlined
            onClick={() => {
              setDeleteKey(record.variantId);
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
      <Table
        columns={columns}
        dataSource={variantRows}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page) => setCurrentPage(page)
        }}
        bordered
        rowKey="variantId"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        title="Remove Variant"
        text="Are you sure you want to delete this variant?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {editVariant && (
        <EditProductModal
          open={!!editVariant}
          onClose={() => setEditVariant(null)}
          product={{
            id: editVariant.productId,
            variantId: editVariant.variantId,
            name: editVariant.title,
            price: editVariant.price,
            quantity: editVariant.stock,
            image: editVariant.img,
            color: editVariant.color,
            colorCode: editVariant.colorCode,
            size: editVariant.size
          }}
          showImage
          title="Edit Product Variant"
          actionLabel="Update"
          onAction={async (formData) => {
            await dispatch(
              updateProduct({
                id: editVariant.variantId,
                formData
              })
            );
            setEditVariant(null);
            window.dispatchEvent(new Event('ProductUpdated'));
          }}
        />
      )}
    </div>
  );
};

export default AdminDetailTable;
