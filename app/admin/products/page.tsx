'use client';

import { useEffect, useState } from 'react';

import { Button } from 'antd';

import { useDispatch } from 'react-redux';

import { addProduct } from '@/redux/slices/products-slice';
import { AppDispatch } from '@/redux/store';

import AdminDetailTable from '@/components/admin-details-table/admin-detail-table-functionality';
import EditProductModal from '@/components/admin-modal/admin-modal';
import LoadingSpinner from '@/components/loading/loading-spinner';
import 'antd/dist/reset.css';
import './products.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddProduct = async (formData: FormData) => {
    await dispatch(addProduct(formData));
    setAddProductOpen(false);
    window.dispatchEvent(new Event('ProductUpdated'));
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
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
          mode="edit"
          product={{
            id: '',
            name: '',
            price: 0,
            quantity: 0,
            image: '',
            color: '',
            colorCode: '',
            size: ''
          }}
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
          mode="upload" // 👈 upload mode from Figma design
          title="Add Multiple Products"
        />
      )}
    </div>
  );
};

export default Page;
