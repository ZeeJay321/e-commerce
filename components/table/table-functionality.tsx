'use client';

import { useEffect, useState } from 'react';

import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Button, Checkbox, Modal, Table
} from 'antd';

import './table.css';

import { CartItem } from '@/models';

const CartTable = () => {
  const [cartData, setCartData] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cartData');
      if (saved) return JSON.parse(saved);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('cartData', JSON.stringify(cartData));
    window.dispatchEvent(new Event('cartUpdated')); // 🔔 notify listeners
  }, [cartData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<number | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<number[]>([]);

  const toggleSelect = (key: number) => {
    setSelectedKeys((prev) => (prev.includes(key)
      ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleSelectAll = () => {
    if (selectedKeys.length === cartData.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(cartData.map((item) => item.id));
    }
  };

  const handleRemove = (key: number) => {
    setCartData((prev) => prev.filter((item) => item.id !== key));
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
  };

  const confirmDelete = () => {
    if (deleteKey !== null) {
      handleRemove(deleteKey);
    }

    setIsModalOpen(false);
    setDeleteKey(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setDeleteKey(null);
  };

  const updateQty = (key: number, type: 'increase' | 'decrease') => {
    setCartData((prev) => prev.map((item) => (item.id === key
      ? {
        ...item,
        qty:
          type === 'increase'
            ? item.qty + 1
            : item.qty > 1
              ? item.qty - 1
              : 1
      }
      : item)));
  };

  const formattedQuantity = (value: number) => value.toString().padStart(2, '0');

  const columns: TableColumnsType<CartItem> = [
    {
      title: (
        <div className="flex pl-3 item-center text-center gap-0.5">
          <Checkbox
            checked={selectedKeys.length === cartData.length && cartData.length > 0}
            indeterminate={
              selectedKeys.length > 0
              && selectedKeys.length < cartData.length
            }
            onChange={toggleSelectAll}
          />
          <span>Product</span>
        </div>
      ),
      dataIndex: 'product',
      render: (text: string, record) => (
        <div className="cart-product-check">
          <Checkbox
            checked={selectedKeys.includes(record.id)}
            onChange={() => toggleSelect(record.id)}
            className="mr-2"
          />
          <div className='cart-product-div'>
            <img src={record.img} alt="" className="cart-product-image" />
            <span className="font-display text-xs whitespace-normal w-full max-w-78">
              {text}
            </span>
          </div>
        </div>
      )
    },
    {
      title: <span className='pl-3'>Color</span>,
      dataIndex: 'color',
      render: (_, record) => (
        <div className="cart-color">
          <span
            className="cart-color-span"
            style={{ backgroundColor: record.colorcode }}
          />
          <span className="font-display text-xs">{record.color}</span>
        </div>
      )
    },
    {
      title: <span className='pl-3'>Size</span>,
      dataIndex: 'size',
      render: (value) => (
        <span className="font-display text-xs pl-3 py-4">{value}</span>
      )
    },
    {
      title: <span className='pl-3'>Qty</span>,
      dataIndex: 'qty',
      render: (value: number, record) => (
        <div className="card-buttons-div">
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.id, 'decrease')}
          >
            -
          </Button>
          <span className="card-buttons-span">
            {formattedQuantity(value)}
          </span>
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.id, 'increase')}
          >
            +
          </Button>
        </div>
      )
    },
    {
      title: <span className='pl-3'>Price</span>,
      dataIndex: 'price',
      render: (value: number) => (
        <span className="font-display text-xs pl-3 py-4">
          $
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: <span className='pl-3'>Actions</span>,
      key: 'actions',
      render: (_, record) => (
        <DeleteOutlined
          onClick={() => {
            setDeleteKey(record.id);
            setIsModalOpen(true);
          }}
          className="cart-button text-red-500 cursor-pointer pl-3 py-4"
        />
      )
    }
  ];

  return (
    <div className="cart-items-div">
      <Table<CartItem>
        columns={columns}
        dataSource={cartData}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
      />

      {/* Confirm Delete Modal */}
      <Modal
        open={isModalOpen}
        footer={(
          <div className="flex justify-center space-x-4">
            <Button onClick={cancelDelete}>No</Button>
            <Button type="primary" danger onClick={confirmDelete}>
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

export default CartTable;
