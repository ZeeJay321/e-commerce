'use client';

import { useEffect, useState } from 'react';

import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import type { TableColumnsType, TableProps } from 'antd';
import { Button, Modal, Table } from 'antd';

import './table.css';

interface CartItem {
  img: string;
  key: number;
  product: string;
  colorcode: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

const rowSelection: TableProps<CartItem>['rowSelection'] = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: CartItem[]) => {
    console.log(
      'selectedRowKeys: ',
      selectedRowKeys,
      'selectedRows: ',
      selectedRows
    );
  }
};

const CartTable = () => {
  // ✅ Initialize from localStorage OR fallback to default data
  const [cartData, setCartData] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cartData');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        img: 'https://www.google.com/imgres?q=cat%20image&imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F4%2F4d%2FCat_November_2010-1a.jpg%2F960px-Cat_November_2010-1a.jpg&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FTabby_cat&docid=oNx0iOzXSsdzRM&tbnid=qbSS319ZRpsjqM&vet=12ahUKEwiKgLGoj8uPAxU7VqQEHeaJJscQM3oECBsQAA..i&w=960&h=1282&hcb=2&ved=2ahUKEwiKgLGoj8uPAxU7VqQEHeaJJscQM3oECBsQAA',
        key: 1,
        product:
          'Cargo Trousers for Men - 6 Pocket Trousers - 6 Pocket Cargo Trousers in all Colors - Cargo Trouser',
        color: 'Beige',
        colorcode: '#F5F5DC',
        size: '34',
        qty: 2,
        price: 0.0
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cartData', JSON.stringify(cartData));
  }, [cartData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<number | null>(null);

  const handleRemove = (key: number) => {
    setCartData((prev) => prev.filter((item) => item.key !== key));
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
    setCartData((prev) => prev.map((item) => (item.key === key
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
      title: 'Product',
      dataIndex: 'product',
      render: (text: string, record) => (
        <div className="cart-product-div">
          <img src={record.img} alt={text} className="cart-product-image" />
          <span className="font-display text-xs">{text}</span>
        </div>
      )
    },
    {
      title: 'Color',
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
      title: 'Size',
      dataIndex: 'size',
      render: (value) => <span className="font-display text-xs">{value}</span>
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      render: (value: number, record) => (
        <div className="card-buttons-div">
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.key, 'decrease')}
          >
            -
          </Button>
          <span className="card-buttons-span">{formattedQuantity(value)}</span>
          <Button
            className="card-buttons-layout"
            size="small"
            onClick={() => updateQty(record.key, 'increase')}
          >
            +
          </Button>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (value: number) => (
        <span className="font-display text-xs">
          $
          {value.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <DeleteOutlined
          onClick={() => {
            setDeleteKey(record.key);
            setIsModalOpen(true);
          }}
          className="cart-button text-red-500 cursor-pointer"
        />
      )
    }
  ];

  return (
    <div className="cart-items-div">
      <Table<CartItem>
        rowSelection={{ type: 'checkbox', ...rowSelection }}
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
