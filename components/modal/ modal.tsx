import { WarningOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import './modal.css';

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onOk: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({
  open,
  title = 'Remove Product',
  message = 'Are you sure you want to delete this item?',
  onOk,
  onCancel
}: DeleteConfirmModalProps) => (
  <Modal
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    okText="Yes"
    cancelText="No"
    centered
  >
    <div className="delete-modal-div">
      {/* Title */}
      <h2 className="delete-modal-title">{title}</h2>

      {/* Icon */}
      <WarningOutlined className="delete-modal-icon" />

      {/* Message */}
      <p className="delete-modal-text">{message}</p>
    </div>
  </Modal>
);

export default DeleteConfirmModal;
