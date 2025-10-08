'use client';

import { useRef, useState } from 'react';

import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Input,
  InputNumber,
  Modal,
  Upload
} from 'antd';

import './admin-modal.css';

type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: 'edit' | 'upload';
  product?: {
    id: string;
    variantId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color: string;
    colorCode: string;
    size: string;
  };
  showImage?: boolean;
  title?: string;
  actionLabel?: string;
  onAction?: (formData: FormData) => Promise<void> | void;
};

const EditProductModal = ({
  open,
  onClose,
  mode = 'edit',
  product,
  showImage = true,
  title = 'Orders Details',
  actionLabel = 'Update',
  onAction
}: EditProductModalProps) => {
  // product fields (for edit mode)
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [color, setColor] = useState(product?.color || '');
  const [colorCode, setColorCode] = useState(product?.colorCode || '');
  const [image, setImage] = useState(product?.image || '');
  const [size, setSize] = useState(product?.size || '');
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
    }
  };

  // build form data once before action
  const buildFormData = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price.toString());
    formData.append('quantity', quantity.toString());
    formData.append('color', color);
    formData.append('colorCode', colorCode);
    formData.append('size', size);
    if (file) formData.append('image', file);
    return formData;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      closable={false}
      className='!h-150'
    >
      {mode === 'upload' ? (
        <>
          {/* Upload Mode (Figma design) */}
          <Button
            type="link"
            onClick={onClose}
            className="content-paragraph"
          >
            <ArrowLeftOutlined className="!text-nav-text !hover:text-blue-700 transition-colors" />
            <span className="hover:text-gray-500 transition-colors">
              {title}
            </span>
          </Button>

          <Divider className="divider-midnight" />

          {/* Upload Box */}
          <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6">
            <Upload
              beforeUpload={(uploadFile) => {
                setFile(uploadFile);
                setImage(URL.createObjectURL(uploadFile));
                return false; // prevent auto upload
              }}
              showUploadList={false}
            >
              <div className="flex flex-col items-center gap-2 cursor-pointer pb-6">
                <UploadOutlined className="text-3xl text-blue-500" />
                <span className="text-gray-500">
                  Drop your file here to upload
                </span>
                <Button type="link" className="p-0">
                  Download Sample File
                </Button>
                <Button className="mt-2">Browse</Button>
              </div>
            </Upload>
          </div>

          {/* Uploaded File List */}
          {file && (
            <div className="mt-4 w-full flex justify-between items-center">
              <span>{file.name}</span>
              <Button danger size="small" onClick={() => setFile(null)}>
                Delete
              </Button>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              disabled={!file}
            >
              Upload File
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode (existing single product edit form) */}
          <Button
            type="link"
            onClick={onClose}
            className="content-paragraph"
          >
            <ArrowLeftOutlined className="!text-nav-text !hover:text-blue-700 transition-colors" />
            <span className="hover:text-gray-500 transition-colors">
              {title}
            </span>
          </Button>

          <Divider className="divider-midnight" />

          <div className="flex gap-8">
            {/* Left - Image OR Upload */}
            <div className="flex-shrink-0 p-3 relative">
              {showImage ? (
                <>
                  <img
                    src={image}
                    alt={product?.name}
                    width={145}
                    height={145}
                    className="object-cover rounded-md border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="image-icon"
                    onClick={handleEditClick}
                  >
                    <EditOutlined className="!text-white text-sm" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Upload Box */}
                  <div
                    className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-blue-500"
                    style={{ width: 145, height: 145 }}
                  >
                    <Upload
                      beforeUpload={(uploadFile) => {
                        setFile(uploadFile);
                        setImage(URL.createObjectURL(uploadFile));
                        return false; // prevent auto upload
                      }}
                      showUploadList={false}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UploadOutlined className="text-blue-500 text-xl" />
                        <Button size="small">Upload</Button>
                      </div>
                    </Upload>
                  </div>

                  {/* Upload status bar */}
                  {file && (
                    <div className="rounded-md bg-green-100 text-green-700 text-sm px-3 py-1">
                      ✅ Upload Successful
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div className="product-info flex-1 flex flex-col">
              <label className="edit-field">Product Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="edit-field-input"
              />

              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="edit-field">Price</label>
                  <InputNumber
                    value={price}
                    onChange={(val) => setPrice(val || 0)}
                    className="edit-field-sub-input"
                    min={0}
                  />
                </div>
                <div className="flex-1">
                  <label className="edit-field">Quantity</label>
                  <InputNumber
                    value={quantity}
                    onChange={(val) => setQuantity(val || 0)}
                    className="edit-field-sub-input"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="edit-field">Color</label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="edit-field-sub-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="edit-field">Color Code</label>
                  <Input
                    value={colorCode}
                    onChange={(e) => setColorCode(e.target.value)}
                    className="edit-field-sub-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="edit-field">Size</label>
                  <Input
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="edit-field-sub-input"
                  />
                </div>
              </div>

              <Button
                type="primary"
                className="self-end mt-6"
                onClick={async () => {
                  const formData = buildFormData();
                  if (onAction) {
                    await onAction(formData);
                  }
                }}
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default EditProductModal;
