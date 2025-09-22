'use client';

import { useEffect, useState } from 'react';

import { Button } from 'antd';

import AdminDetailTable from '@/components/admin-details-table/admin-detail-table-functionality';
import EditProductModal from '@/components/admin-modal/admin-modal'; // ✅ import your modal
import LoadingSpinner from '@/components/loading/loading-spinner';
import 'antd/dist/reset.css';
import './home.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false); // 👈 new state

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
          {/* Add Single Product */}
          <Button
            type="default"
            className="px-4 py-1.5"
            onClick={() => setAddProductOpen(true)}
          >
            + Add a Single Product
          </Button>

          {/* Add Multiple Products */}
          <Button
            type="primary"
            className="px-4 py-1.5"
            onClick={() => setAddMultipleOpen(true)} // 👈 open multiple upload modal
          >
            + Add Multiple Products
          </Button>
        </div>
      </div>

      <AdminDetailTable />

      {/* 👇 Add Product Modal */}
      {addProductOpen && (
        <EditProductModal
          open={addProductOpen}
          onClose={() => setAddProductOpen(false)}
          mode="edit" // single product edit mode
          product={{
            id: '',
            name: '',
            price: 0,
            quantity: 0,
            image: '',
            color: '',
            colorCode: ''
          }}
          showImage={false}
          title="Add a New Product"
          actionLabel="Save"
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
