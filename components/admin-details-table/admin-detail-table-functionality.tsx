'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  UndoOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Input,
  Spin,
  Table,
  Tooltip
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { Product, ProductVariant, Size } from '@/models';
import {
  addVariant,
  clearProducts,
  deleteProduct,
  editProductTitle,
  fetchProducts,
  toggleVariant,
  updateProductVariant
} from '@/redux/slices/products-slice';
import { AppDispatch, RootState } from '@/redux/store';

import EditProductModal from '@/components/admin-modal/admin-modal';
import CustomNotification from '@/components/notifications/notifications-functionality';

import ConfirmDeleteModal from '../delete-modal/delete-modal';

import './admin-detail-table.css';

const AdminDetailTable = () => {
  const [isDeleteVariantModalOpen, setIsDeleteVariantModalOpen] = useState(false);
  const [isReActiveVariantModalOpen, setIsReActiveVariantModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addVariantProduct, setAddVariantProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const {
    items:
    products,
    total,
    loading,
    error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const handleDeleteVariant = async (deleteId: string | null) => {
    if (!deleteId) return;

    try {
      const res = await dispatch(toggleVariant(deleteId)).unwrap();

      if (res) {
        setNotification({
          type: res.success ? 'success' : 'error',
          message: res.message
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errMessage = (err as string) || '';
      setNotification({
        type: 'error',
        message: 'Operation Failed',
        description:
          errMessage || 'Something went wrong while deleting the variant.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteProduct = async (deleteId: string | null) => {
    if (!deleteId) return;

    try {
      const res = await dispatch(deleteProduct(deleteId)).unwrap();

      if (res) {
        setNotification({
          type: res.success ? 'success' : 'error',
          message: res.message
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errMessage = (err as string) || '';
      setNotification({
        type: 'error',
        message: errMessage || 'Something went wrong while deleting the product.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleReactivateVariant = async (deleteId: string | null) => {
    if (!deleteId) return;

    try {
      const res = await dispatch(toggleVariant(deleteId)).unwrap();

      if (res) {
        setNotification({
          type: res.success ? 'success' : 'error',
          message: res.message
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errMessage = (err as string) || '';
      setNotification({
        type: 'error',
        message: 'Operation Failed',
        description:
          errMessage || 'Something went wrong while deleting the variant.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const confirmVariantDelete = async () => {
    if (deleteKey !== null) {
      await handleDeleteVariant(deleteKey);
    }
    setIsDeleteVariantModalOpen(false);
    setDeleteKey(null);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  const confirmProductDelete = async () => {
    if (deleteKey !== null) {
      await handleDeleteProduct(deleteKey);
    }
    setIsDeleteProductModalOpen(false);
    setDeleteKey(null);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  const confirmVariantReactivate = async () => {
    if (deleteKey !== null) {
      await handleReactivateVariant(deleteKey);
    }
    setIsReActiveVariantModalOpen(false);
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

  const cancelVariantReactivate = () => {
    setIsReActiveVariantModalOpen(false);
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
  }, [getUpdatedProducts]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: 'Operation Failed',
        description: error
      });

      setTimeout(() => setNotification(null), 1000);
    }
  }, [error]);

  const handleEditConfirm = async (
    productId: string,
    changeTitle: string,
    currentTitle: string
  ) => {
    if (changeTitle.trim() === currentTitle.trim()) {
      setNotification({
        type: 'error',
        message: 'Title is the same, nothing to update'
      });
      setEditingTitleId(null);
      return;
    }

    try {
      await dispatch(editProductTitle({
        id: productId,
        title: changeTitle
      })).unwrap();

      setNotification({
        type: 'success',
        message: `Product title updated to "${changeTitle}"`
      });

      setEditingTitleId(null);
      window.dispatchEvent(new Event('ProductUpdated'));
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : (err as string) || 'Error updating title'
      });
    }
  };

  const columns: TableColumnsType<Product> = [
    {
      title: <span className="table-span-head">Title</span>,
      dataIndex: 'title',
      render: (text: string, record: Product) => {
        const isEditing = editingTitleId === record.id;
        return (
          <div className="table-span flex items-center gap-2 p-2">
            {isEditing ? (
              <>
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  style={{ width: 200 }}
                  size="small"
                />
                <CheckOutlined
                  className="add-button"
                  onClick={() => handleEditConfirm(record.id, tempTitle, record.title)}
                />
                <CloseOutlined
                  className="delete-button"
                  onClick={() => {
                    setEditingTitleId(null);
                    setTempTitle('');
                  }}
                />
              </>
            ) : (
              <span>{text}</span>
            )}
          </div>
        );
      }
    }, {
      title: <span className="table-span-head">Actions</span>,
      key: 'actions',
      render: (record) => (
        <div className="table-div flex">
          <Tooltip title="Add Variant" placement="top">
            <PlusCircleOutlined
              onClick={() => setAddVariantProduct(record)}
              className="add-button"
            />
          </Tooltip>

          <Tooltip title="Edit Product Title" placement="top">
            <EditOutlined
              className="edit-button"
              onClick={() => {
                setEditingTitleId(record.id);
                setTempTitle(record.title);
              }}
            />
          </Tooltip>

          <Tooltip title="Delete Product" placement="top">
            <DeleteOutlined
              onClick={() => {
                setDeleteKey(record.id);
                setIsDeleteProductModalOpen(true);
              }}
              className="delete-button"
            />
          </Tooltip>
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
        title: <span className="table-span-head">Status</span>,
        dataIndex: 'isDeleted',
        render: (isDeleted: boolean) => {
          const statusLabel = isDeleted ? 'Inactive' : 'Active';
          const styles = isDeleted
            ? {
              bg: '#fecaca',
              color: '#7f1d1d'
            }
            : {
              bg: '#bbf7d0',
              color: '#065f46'
            };

          return (
            <span
              style={{
                backgroundColor: styles.bg,
                color: styles.color,
                borderRadius: '9999px',
                padding: '5px 14px',
                fontWeight: 600,
                display: 'inline-block',
                textAlign: 'center',
                fontSize: '0.8rem',
                boxShadow: '0 0 6px rgba(0,0,0,0.1)',
                letterSpacing: '0.3px',
                minWidth: 90
              }}
            >
              {statusLabel}
            </span>
          );
        }
      }, {
        title: <span className="table-span-head">Actions</span>,
        key: 'actions',
        render: (_: unknown, variant: ProductVariant) => (
          <div className="table-div">
            <Tooltip title="Edit Variant" placement="top">
              <EditOutlined
                className="edit-button"
                onClick={() => {
                  setEditProduct(product);
                  setEditVariant(variant);
                }}
              />
            </Tooltip>

            {variant.isDeleted ? (
              <Tooltip title="Activate Variant Status" placement="top">
                <UndoOutlined
                  onClick={() => {
                    setDeleteKey(variant.id);
                    setIsReActiveVariantModalOpen(true);
                  }}
                  className="undo-button"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Deactivate Variant Status" placement="top">
                <DeleteOutlined
                  onClick={() => {
                    setDeleteKey(variant.id);
                    setIsDeleteVariantModalOpen(true);
                  }}
                  className="delete-button"
                />
              </Tooltip>
            )}
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

  return (
    <div className="cart-items-div">
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}

      <Table<Product>
        columns={columns}
        dataSource={products}
        expandable={{ expandedRowRender }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page)
        }}
        bordered
        rowKey="id"
      />

      <ConfirmDeleteModal
        open={isReActiveVariantModalOpen}
        title="Reactivate Product Variant"
        text="Are you sure you want to reactivate this item?"
        onCancel={cancelVariantReactivate}
        onConfirm={confirmVariantReactivate}
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

      {/* Edit Variant Modal */}
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
            try {
              // Extract values from FormData
              const formPrice = formData.get('price');
              const formQuantity = formData.get('quantity');
              const formColor = formData.get('color');
              const formColorCode = formData.get('colorCode');
              const formSize = formData.get('size');
              const formImage = formData.get('image'); // File or null

              // Compare each field
              const hasChanges = Number(formPrice) !== editVariant.price
                || Number(formQuantity) !== editVariant.stock
                || formColor !== editVariant.color
                || formColorCode !== editVariant.colorCode
                || formSize !== editVariant.size
                || (formImage && formImage instanceof File);

              if (!hasChanges) {
                setNotification({
                  type: 'error',
                  message: 'No changes detected — nothing to update.'
                });
                setTimeout(() => setNotification(null), 3000);
                return;
              }

              const res = await dispatch(
                updateProductVariant({
                  id: editVariant.id,
                  productId: editProduct.id,
                  formData
                })
              ).unwrap();

              if (res) {
                setNotification({
                  type: 'success',
                  message: 'Product Variant updated successfully'
                });
                setTimeout(() => setNotification(null), 3000);
                window.dispatchEvent(new Event('ProductUpdated'));
                setEditProduct(null);
                setEditVariant(null);
              }
            } catch (err) {
              const errMessage = (err as string) || '';
              setNotification({
                type: 'error',
                message: 'Operation Failed',
                description:
                  errMessage
                  || 'Something went wrong while updating the product variant.'
              });
              setTimeout(() => setNotification(null), 3000);
            }
          }}
        />
      )}

      {/* Add Variant Modal */}
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
            size: Size.S
          }}
          showImage={false}
          title="Add New Variant"
          actionLabel="Add"
          onAction={async (formData) => {
            try {
              const res = await dispatch(
                addVariant({
                  productId: addVariantProduct.id,
                  formData
                })
              );

              if (res) {
                setNotification({
                  type: 'success',
                  message: 'Product Variant added successfully'
                });
                setTimeout(() => setNotification(null), 3000);
                window.dispatchEvent(new Event('ProductUpdated'));
                setAddVariantProduct(null);
              }
            } catch (err) {
              const errMessage = (err as string) || '';
              setNotification({
                type: 'error',
                message: 'Operation Failed',
                description:
                  errMessage
                  || 'Something went wrong while adding the product variant.'
              });
              setTimeout(() => setNotification(null), 3000);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminDetailTable;
