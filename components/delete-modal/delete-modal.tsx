'use client';

import { WarningOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store';

import './delete-modal.css';

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDeleteModal = ({
  open,
  title,
  text,
  onCancel,
  onConfirm
}: ConfirmDeleteModalProps) => {
  const productsLoading = useSelector((state: RootState) => state.products.loading);
  const ordersLoading = useSelector((state: RootState) => state.orders.loading);

  return (
    <Modal
      open={open}
      footer={(
        <div className="flex justify-center gap-8">
          <Button
            className="max-w-20 w-full"
            onClick={onCancel}
            disabled={productsLoading || ordersLoading}
          >
            No
          </Button>
          <Button
            className="max-w-20 w-full"
            type="primary"
            danger
            onClick={onConfirm}
            loading={productsLoading || ordersLoading}
          >
            Yes
          </Button>
        </div>
      )}
      onCancel={onCancel}
      centered
    >
      <div className="delete-modal-div">
        <h2 className="delete-modal-title">{title}</h2>
        <WarningOutlined className="delete-modal-icon" />
        <p className="delete-modal-text">{text}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
