'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Spin,
  Table
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { Product, ProductVariant } from '@/models';
import {
  addVariant,
  clearProducts,
  deleteProduct,
  deleteVariant,
  fetchProducts,
  updateProductVariant
} from '@/redux/slices/products-slice';
import { AppDispatch, RootState } from '@/redux/store';

import EditProductModal from '@/components/admin-modal/admin-modal';

import ConfirmDeleteModal from '../delete-modal/delete-modal';

import './admin-detail-table.css';

const AdminDetailTable = () => {
  const [isDeleteVariantModalOpen, setIsDeleteVariantModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [reload, setReload] = useState(false);
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addVariantProduct, setAddVariantProduct] = useState<Product | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const {
    items: products, total, loading, error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const handleDeleteVariant = (deleteId: string | null) => {
    if (!deleteId) return;
    dispatch(deleteVariant(deleteId));
  };

  const confirmVariantDelete = () => {
    if (deleteKey !== null) {
      handleDeleteVariant(deleteKey);
    }
    setReload((prev) => !prev);
    setIsDeleteVariantModalOpen(false);
    setDeleteKey(null);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  const handleDeleteProduct = (deleteId: string | null) => {
    if (!deleteId) return;
    dispatch(deleteProduct(deleteId));
  };

  const confirmProductDelete = () => {
    if (deleteKey !== null) {
      handleDeleteProduct(deleteKey);
    }
    setReload((prev) => !prev);
    setIsDeleteProductModalOpen(false);
    setDeleteKey(null);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  const cancelVariantDelete = () => {
    setIsDeleteVariantModalOpen(false);
    setDeleteKey(null);
  };

  const cancelProductDelete = () => {
    setIsDeleteProductModalOpen(false);
    setDeleteKey(null);
  };

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

  const columns: TableColumnsType<Product> = [
    {
      title: <span className="table-span-head">Title</span>,
      dataIndex: 'title',
      render: (text: string) => (
        <div className="cart-product-div">
          <span className="font-display text-xs whitespace-normal">{text}</span>
        </div>
      )
    }, {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: (record) => (
        <div className="table-div">
          <PlusCircleOutlined
            onClick={() => {
              setAddVariantProduct(record);
            }}
            className="edit-button"
          />
          <DeleteOutlined
            onClick={() => {
              setDeleteKey(record.id);
              setIsDeleteProductModalOpen(true);
            }}
            className="delete-button"
          />
        </div>
      )
    }
  ];

  // 🔹 Nested table for variants
  const expandedRowRender = (product: Product) => {
    const variantColumns = [
      {
        title: <span className="table-span-head">Color</span>,
        dataIndex: 'color',
        render: (color: string, variant: ProductVariant) => (
          <div className="flex items-center gap-0.5 pl-3 py-4">
            <img
              src={variant.img || '/placeholder.png'}
              className="cart-product-image"
            />
            <span
              className="inline-block w-4 h-4 rounded-full border"
              style={{ backgroundColor: variant.colorCode }}
            />
            {color}
          </div>
        )
      }, {
        title: <span className="table-span-head">Size</span>,
        dataIndex: 'size'
      }, {
        title: <span className="table-span-head">Price</span>,
        dataIndex: 'price',
        render: (price: number) => (
          <span className="table-span">
            $
            {price.toFixed(2)}
          </span>
        )
      }, {
        title: <span className="table-span-head">Stock</span>,
        dataIndex: 'stock'
      }, {
        title: <span className="table-span-head">Actions</span>,
        key: 'actions',
        render: (_: unknown, variant: ProductVariant) => (
          <div className="table-div">
            <EditOutlined
              className="edit-button"
              onClick={() => {
                setEditProduct(product);
                setEditVariant(variant);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                setDeleteKey(variant.id);
                setIsDeleteVariantModalOpen(true);
              }}
              className="delete-button"
            />
          </div>
        )
      }
    ];

    return (
      <div className="max-h-[400px] overflow-y-auto border-1 border-gray-300 rounded-md">
        <Table
          columns={variantColumns}
          dataSource={product.variants || []}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </div>
    );
  };

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
        expandable={{ expandedRowRender }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page) => setCurrentPage(page)
        }}
        bordered
        rowKey="id"
      />

      {/* Delete Confirmation Variant Modal */}
      <ConfirmDeleteModal
        open={isDeleteVariantModalOpen}
        title="Remove Product Variant"
        text="Are you sure you want to delete this item?"
        onCancel={cancelVariantDelete}
        onConfirm={confirmVariantDelete}
      />

      {/* Delete Confirmation Product Modal */}
      <ConfirmDeleteModal
        open={isDeleteProductModalOpen}
        title="Remove Product"
        text="Are you sure you want to delete this item?"
        onCancel={cancelProductDelete}
        onConfirm={confirmProductDelete}
      />

      {/* Edit Modal */}
      {editProduct && editVariant && (
        <EditProductModal
          open={!!editProduct}
          onClose={() => {
            setEditProduct(null);
            setEditVariant(null);
          }}
          product={{
            id: editProduct.id,
            name: editProduct.title
          }}
          variant={{
            id: editVariant.id,
            price: editVariant.price,
            quantity: editVariant.stock,
            image: editVariant.img,
            color: editVariant.color,
            colorCode: editVariant.colorCode,
            size: editVariant.size
          }}
          showImage
          title="Edit Product"
          actionLabel="Update"
          onAction={async (formData) => {
            await dispatch(updateProductVariant({
              id: editVariant.id,
              productId: editProduct.id,
              formData
            }));
            setEditProduct(null);
            window.dispatchEvent(new Event('ProductUpdated'));
          }}
        />
      )}

      {addVariantProduct && (
        <EditProductModal
          open={!!addVariantProduct}
          onClose={() => setAddVariantProduct(null)}
          mode="edit"
          product={{
            id: addVariantProduct.id,
            name: addVariantProduct.title
          }}
          variant={{
            id: '',
            price: 0,
            quantity: 0,
            image: '',
            color: '',
            colorCode: '',
            size: ''
          }}
          showImage={false}
          title="Add New Variant"
          actionLabel="Add"
          onAction={async (formData) => {
            await dispatch(addVariant({
              productId: addVariantProduct.id,
              formData
            }));
            setAddVariantProduct(null);
            window.dispatchEvent(new Event('ProductUpdated'));
          }}
        />
      )}
    </div>
  );
};

export default AdminDetailTable;
