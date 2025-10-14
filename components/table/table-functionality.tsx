'use client';

import { useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Button,
  Checkbox,
  Spin,
  Table
} from 'antd';

import { useSelector } from 'react-redux';

import { CartItem } from '@/models';
import 'antd/dist/reset.css';
import './table.css';

import { RootState } from '@/redux/store';

import ConfirmDeleteModal from '../delete-modal/delete-modal';

interface CartTableProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartTable = ({ cartItems, setCartItems }: CartTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const orderLoading = useSelector((state: RootState) => state.orders.loading);
  const productLoading = useSelector((state: RootState) => state.products.loading);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key)
      ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleSelectAll = () => {
    if (selectedKeys.length === cartItems.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(cartItems.map((item) => item.id));
    }
  };

  const handleRemove = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== key));
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
  };

  const handleBulkRemove = () => {
    setCartItems((prev) => prev.filter((item) => !selectedKeys.includes(item.id)));
    setSelectedKeys([]);
    setIsBulkDeleteOpen(false);
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

  const updateQty = (key: string, type: 'increase' | 'decrease') => {
    setCartItems((prev) => prev.map((item) => {
      if (item.variantId !== key) return item;

      if (type === 'increase') {
        if (item.qty < item.stock) {
          return { ...item, qty: item.qty + 1 };
        }
        return item;
      }

      if (type === 'decrease') {
        return { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 };
      }

      return item;
    }));
  };

  const columns: TableColumnsType<CartItem> = [
    {
      title: (
        <div className="flex pl-3 item-center text-center gap-0.5">
          <Checkbox
            checked={selectedKeys.length === cartItems.length && cartItems.length > 0}
            indeterminate={
              selectedKeys.length > 0 && selectedKeys.length < cartItems.length
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
          <div className="cart-product-div">
            <img src={record.img} alt="" className="cart-product-image" />
            <span className="font-display text-xs whitespace-normal w-full max-w-78">
              {text}
            </span>
          </div>
        </div>
      )
    }, {
      title: <span className="pl-3">Color</span>,
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
    }, {
      title: <span className="pl-3">Size</span>,
      dataIndex: 'size',
      render: (value) => (
        <span className="font-display text-xs pl-3 py-4">{value}</span>
      )
    }, {
      title: <span className="pl-3">Qty</span>,
      dataIndex: 'qty',
      render: (value: number, record) => (
        <div className="card-buttons-div">
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.variantId, 'decrease')}
          >
            -
          </Button>
          <span
            contentEditable
            role="textbox"
            tabIndex={0}
            aria-label="Edit quantity"
            suppressContentEditableWarning
            className="card-buttons-span outline-none border border-gray-300 rounded-md px-2 text-center min-w-[24px]"
            onBlur={(e) => {
              const text = e.currentTarget.textContent?.trim() || '1';
              let newQty = Number(text);
              if (Number.isNaN(newQty) || newQty < 1) newQty = 1;
              if (newQty > record.stock) newQty = record.stock;

              setCartItems((prev) => prev.map((item) => (item.id === record.id ? {
                ...item,
                qty: newQty
              } : item)));

              e.currentTarget.textContent = newQty.toString();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          >
            {value}
          </span>
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.variantId, 'increase')}
            disabled={record.qty >= record.stock}
          >
            +
          </Button>
        </div>
      )
    }, {
      title: <span className="pl-3">Price / unit</span>,
      dataIndex: 'price',
      render: (value: number) => (
        <span className="font-display text-xs pl-3 py-4">
          $
          {value.toFixed(2)}
        </span>
      )
    }, {
      title: <span className="pl-3">Total Price</span>,
      key: 'total',
      render: (_, record) => (
        <span className="font-display text-xs pl-3 py-4">
          $
          {(record.price * record.qty).toFixed(2)}
        </span>
      )
    }, {
      title: <span className="pl-3">Actions</span>,
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
      {(orderLoading || productLoading) && (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      )}
      {(selectedKeys.length > 0) && (
        <div className="mb-3 flex justify-end">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setIsBulkDeleteOpen(true)}
          >
            Delete Selected (
            {selectedKeys.length}
            )
          </Button>
        </div>
      )}

      {(!orderLoading && !productLoading) && (
        <Table<CartItem>
          columns={columns}
          dataSource={cartItems}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
      )}

      <ConfirmDeleteModal
        open={isModalOpen}
        title="Remove Product"
        text="Are you sure you want to delete this item?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      <ConfirmDeleteModal
        open={isBulkDeleteOpen}
        title="Remove Selected Products"
        text={`Are you sure you want to delete ${selectedKeys.length} item(s)?`}
        onCancel={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkRemove}
      />
    </div>
  );
};

export default CartTable;
