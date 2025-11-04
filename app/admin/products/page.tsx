'use client';

import { useEffect, useState } from 'react';

import { Button } from 'antd';

import { useDispatch } from 'react-redux';

import { addProduct, importProductsCsv } from '@/redux/slices/products-slice';
import { AppDispatch } from '@/redux/store';

import AdminDetailTable from '@/components/admin-details-table/admin-detail-table-functionality';
import EditProductModal from '@/components/admin-modal/admin-modal';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';
import 'antd/dist/reset.css';
import './products.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const handleImportProducts = async (file: File) => {
    try {
      const res = await dispatch(importProductsCsv(file)).unwrap();

      if (res) {
        setAddMultipleOpen(false);
        window.dispatchEvent(new Event('ProductUpdated'));

        setNotification({
          type: 'success',
          message: 'Products CSV uploaded successfully'
        });

        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errMessage = (err as string) || '';
      setNotification({
        type: 'error',
        message: 'Import Failed',
        description: errMessage || 'Something went wrong while importing products.'
      });

      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAddProduct = async (formData: FormData) => {
    try {
      const res = await dispatch(addProduct(formData)).unwrap();

      if (res) {
        setAddProductOpen(false);
        window.dispatchEvent(new Event('ProductUpdated'));

        setNotification({
          type: 'success',
          message: 'Product added successfully'
        });

        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      const errMessage = err as string || '';
      setNotification({
        type: 'error',
        message: 'Operation Failed',
        description: errMessage || 'Something went wrong while adding the product.'
      });

      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}
      <div className="content-div">
        <span className="content-paragraph">Our Products</span>
        <div className="content-features w-full">
          <Button
            type="default"
            className="px-4 py-1.5"
            onClick={() => setAddProductOpen(true)}
          >
            + Add a Single Product
          </Button>

          <Button
            type="primary"
            className="px-4 py-1.5"
            onClick={() => setAddMultipleOpen(true)}
          >
            + Add Multiple Products
          </Button>
        </div>
      </div>

      <AdminDetailTable />

      {addProductOpen && (
        <EditProductModal
          open={addProductOpen}
          onClose={() => setAddProductOpen(false)}
          mode="create"
          showImage={false}
          title="Add a New Product"
          actionLabel="Save"
          onAction={handleAddProduct}

        />
      )}

      {/* 👇 Add Multiple Products Modal */}
      {addMultipleOpen && (
        <EditProductModal
          open={addMultipleOpen}
          onClose={() => setAddMultipleOpen(false)}
          mode="upload"
          title="Add Multiple Products"
          onUploadAction={handleImportProducts}
        />
      )}
    </div>
  );
};

export default Page;
