'use client';

import { useRef, useState } from 'react';

import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Button,
  ColorPicker,
  Divider,
  Input,
  InputNumber,
  Modal,
  Select,
  Upload
} from 'antd';
import type { Color } from 'antd/es/color-picker';

import { useSelector } from 'react-redux';

import { Size } from '@/models';

import './admin-modal.css';

import { RootState } from '@/redux/store';

import CustomNotification from '../notifications/notifications-functionality';

const requiredColumns = [
  'product_id',
  'title',
  'isDeleted',
  'createdAt',
  'updatedAt',
  'variant_id',
  'color',
  'colorCode',
  'size',
  'img',
  'price',
  'stock',
  'variant_isDeleted'
];

type VariantForm = {
  id: string;
  price: number;
  quantity: number;
  image?: string;
  color: string;
  colorCode: string;
  size: Size;
  file?: File | null;
};

type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: 'edit' | 'upload' | 'create';
  product?: {
    id: string;
    name: string;
  };
  variant?: VariantForm;
  showImage?: boolean;
  title?: string;
  actionLabel?: string;
  onAction?: (formData: FormData) => Promise<void> | void;
  onUploadAction?: (file: File) => Promise<void> | void;

};

const EditProductModal = ({
  open,
  onClose,
  mode = 'edit',
  product,
  variant,
  showImage = true,
  title = 'Orders Details',
  actionLabel = 'Update',
  onAction,
  onUploadAction
}: EditProductModalProps) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(variant?.price || 0);
  const [quantity, setQuantity] = useState(variant?.quantity || 0);
  const [color, setColor] = useState(variant?.color || '');
  const [colorCode, setColorCode] = useState(variant?.colorCode || '');
  const [colorError, setColorError] = useState(false);
  const [colorErrors, setColorErrors] = useState<Record<string, boolean>>({});
  const [image, setImage] = useState(variant?.image || '');
  const [size, setSize] = useState(variant?.size || '');
  const [file, setFile] = useState<File | null>(null);
  const {
    loading
  } = useSelector(
    (state: RootState) => state.products
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  // Generating identifier for saving image uniquely
  const generateId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const [variants, setVariants] = useState<VariantForm[]>([
    {
      id: generateId(),
      price: 1,
      quantity: 1,
      color: '',
      colorCode: '',
      size: Size.S,
      file: null,
      image: ''
    }
  ]);

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

  const updateVariant = <K extends keyof VariantForm>(
    id: string,
    field: K,
    value: VariantForm[K]
  ) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: generateId(),
        price: 1,
        quantity: 1,
        color: '',
        colorCode: '',
        size: Size.S,
        file: null
      }
    ]);
  };

  const buildFormData = () => {
    const formData = new FormData();

    if (mode === 'create') {
      formData.append('name', name);

      const plainVariants = variants.map((v) => ({
        id: v.id,
        price: v.price,
        quantity: v.quantity,
        color: v.color,
        colorCode: v.colorCode,
        size: v.size,
        image: v.image
      }));

      formData.append('variants', JSON.stringify(plainVariants));

      variants.forEach((v) => {
        if (v.file) {
          const ext = v.file.name.split('.').pop();
          const newFile = new File([v.file], `${v.id}.${ext}`, { type: v.file.type });
          formData.append(`image_${v.id}`, newFile);
        }
      });
    } else if (mode === 'edit') {
      formData.append('price', price.toString());
      formData.append('quantity', quantity.toString());
      formData.append('color', color);
      formData.append('colorCode', colorCode);
      formData.append('size', size);
      if (file) {
        const ext = file.name.split('.').pop();
        const newFile = new File([file], `${generateId()}.${ext}`, { type: file.type });
        formData.append('image', newFile);
      }
    }

    return formData;
  };

  return (
    <div>
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}
      <Modal
        open={open}
        onCancel={() => {
          onClose();
          setFile(null);
          setImage('');
        }}
        footer={null}
        width={800}
        closable={false}
        className="!h-150"
      >
        {mode === 'upload' ? (
          <>
            <Button type="link" onClick={onClose} className="content-paragraph">
              <ArrowLeftOutlined className="!text-nav-text !hover:text-blue-700 transition-colors" />
              <span className="hover:text-gray-500 transition-colors">{title}</span>
            </Button>

            <Divider className="divider-midnight" />

            <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              <Upload
                accept=".csv"
                beforeUpload={async (uploadFile) => {
                  const text = await uploadFile.text();
                  const firstLine = text.split('\n')[0];
                  const headers = firstLine
                    .replace(/\r/g, '')
                    .split(',')
                    .map((h) => h.trim());

                  const missing = requiredColumns.filter(
                    (col) => !headers.includes(col)
                  );

                  if (missing.length > 0) {
                    setNotification({
                      type: 'error',
                      message: 'Invalid CSV',
                      description: `The following required columns are missing: ${missing.join(', ')}`
                    });
                    setTimeout(() => setNotification(null), 4000);
                    return false;
                  }

                  setFile(uploadFile);
                  setImage(URL.createObjectURL(uploadFile));
                  return false;
                }}
                showUploadList={false}
              >
                <div className="flex flex-col items-center gap-2 cursor-pointer pb-6">
                  <UploadOutlined className="text-3xl text-blue-500" />
                  <span className="text-gray-500">
                    Drop your file here to upload
                  </span>

                  <Button className="mt-2">Browse</Button>
                </div>
              </Upload>
              <a href="/sample/sample.csv" download className="mt-2">
                <Button type="link" className="p-0">
                  Download Sample File
                </Button>
              </a>
            </div>

            {file && (
              <div className="mt-4 w-full flex justify-between items-center">
                <span>{file.name}</span>
                <Button danger size="small" onClick={() => setFile(null)}>
                  Delete
                </Button>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                type="primary"
                disabled={!file}
                loading={loading}
                onClick={() => {
                  if (onUploadAction && file) {
                    onUploadAction(file);
                  }
                }}
              >
                Upload File
              </Button>
            </div>
          </>
        ) : mode === 'create' ? (
          <>
            <Button type="link" onClick={onClose} className="content-paragraph">
              <ArrowLeftOutlined className="!text-nav-text !hover:text-blue-700 transition-colors" />
              <span className="hover:text-gray-500 transition-colors">{title}</span>
            </Button>

            <Divider className="divider-midnight" />

            <div className="flex flex-col gap-4">
              <label className="create-field">Product Title</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product title"
                className="edit-field-input"
              />

              <Divider>
                Product Variants
              </Divider>

              {variants.map((v) => (
                <div
                  key={v.id}
                  className="flex gap-8 border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 relative"
                >
                  {variants.length > 1 && (
                    <Button
                      type="text"
                      danger
                      className="absolute right-2 top-2"
                      onClick={() => removeVariant(v.id)}
                    >
                      Remove
                    </Button>
                  )}

                  {/* Upload */}
                  <div className="flex-shrink-0 p-3 relative">
                    <div className="flex flex-col gap-2">
                      <div
                        className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-blue-500"
                        style={{ width: 145, height: 145 }}
                      >
                        <Upload
                          accept=".jpg,.jpeg,.png"
                          beforeUpload={(uploadFile) => {
                            updateVariant(v.id, 'file', uploadFile);
                            updateVariant(v.id, 'image', URL.createObjectURL(uploadFile));
                            return false;
                          }}
                          showUploadList={false}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <UploadOutlined className="text-blue-500 text-xl" />
                            <Button size="small">Upload</Button>
                          </div>
                        </Upload>
                      </div>

                      {v.image && (
                        <div className="rounded-md bg-green-100 text-green-700 text-sm px-3 py-1">
                          ✅ Upload Successful
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="product-info flex-1 flex flex-col">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <label className="edit-field">Price</label>
                        <InputNumber
                          value={v.price}
                          onChange={(val) => updateVariant(v.id, 'price', val || 1)}
                          className="edit-field-sub-input"
                          min={0}
                          formatter={(value) => `$ ${value}`}

                        />
                      </div>
                      <div className="flex-1">
                        <label className="edit-field">Quantity</label>
                        <InputNumber
                          value={v.quantity}
                          onChange={(val) => updateVariant(v.id, 'quantity', val || 1)}
                          className="edit-field-sub-input"
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 mt-3">
                      <div className="flex-1">
                        <label className="edit-field">Color</label>
                        <Input
                          value={v.color}
                          onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                          className="edit-field-sub-input"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="edit-field">Color Code</label>
                        <div className="flex items-center text-center gap-2">
                          <ColorPicker
                            value={v.colorCode || '#ffffff'}
                            onChange={(colorUse: Color) => updateVariant(v.id, 'colorCode', colorUse.toHexString())}
                            className='mb-4'
                            disabledAlpha
                          />

                          <Input
                            value={v.colorCode}
                            onChange={(e) => {
                              const { value } = e.target;
                              const hexPattern = /^#([0-9A-Fa-f]{6})$/;
                              updateVariant(v.id, 'colorCode', value);
                              setColorErrors((prev) => ({
                                ...prev,
                                [v.id]: value !== '' && !hexPattern.test(value)
                              }));
                            }}
                            className={`edit-field-sub-input ${colorErrors[v.id] ? 'border-red-500' : ''}`}
                            placeholder="#FFFFFF"
                            maxLength={7}
                          />
                        </div>
                        {colorErrors[v.id] && (
                          <p className="text-red-500 text-xs mt-1">
                            Invalid color code. Use format #RRGGBB.
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="edit-field">Size</label>
                        <Select
                          value={v.size}
                          onChange={(value) => updateVariant(v.id, 'size', value)}
                          className="edit-field-sub-input w-full"
                          options={[
                            { value: 'S', label: 'Small (S)' },
                            { value: 'M', label: 'Medium (M)' },
                            { value: 'L', label: 'Large (L)' },
                            { value: 'XL', label: 'Extra Large (XL)' }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button type="dashed" onClick={addVariant} className="self-start mt-2">
                + Add Variant
              </Button>

              <div className="flex justify-end mt-6">
                <Button
                  type="primary"
                  disabled={!name.trim() || variants.length === 0}
                  loading={loading}
                  onClick={async () => {
                    const formData = buildFormData();
                    if (onAction) await onAction(formData);
                  }}
                >
                  {actionLabel || 'Create Product'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Button type="link" onClick={onClose} className="content-paragraph">
              <ArrowLeftOutlined className="!text-nav-text !hover:text-blue-700 transition-colors" />
              <span className="hover:text-gray-500 transition-colors">{title}</span>
            </Button>

            <Divider className="divider-midnight" />

            <div className="flex gap-8">
              {/* Image */}
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
                    <div
                      className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-blue-500"
                      style={{ width: 145, height: 145 }}
                    >
                      <Upload
                        accept=".jpg,.jpeg,.png"
                        beforeUpload={(uploadFile) => {
                          setFile(uploadFile);
                          setImage(URL.createObjectURL(uploadFile));
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UploadOutlined className="text-blue-500 text-xl" />
                          <Button size="small">Upload</Button>
                        </div>
                      </Upload>
                    </div>
                    {file && (
                      <div className="rounded-md bg-green-100 text-green-700 text-sm px-3 py-1">
                        ✅ Upload Successful
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="product-info flex-1 flex flex-col">
                <label className="edit-field">Product Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled
                  className="edit-field-input"
                />

                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="edit-field">Price</label>
                    <InputNumber
                      value={price}
                      onChange={(val) => setPrice(val || 1)}
                      className="edit-field-sub-input"
                      min={0}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="edit-field">Quantity</label>
                    <InputNumber
                      value={quantity}
                      onChange={(val) => setQuantity(val || 1)}
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
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={colorCode || '#ffffff'}
                        onChange={(colorUse: Color) => setColorCode(colorUse.toHexString())}
                        className='mb-4'
                        disabledAlpha
                      />

                      <Input
                        value={colorCode}
                        onChange={(e) => {
                          const { value } = e.target;
                          const hexPattern = /^#([0-9A-Fa-f]{6})$/;
                          setColorCode(value);
                          setColorError(value !== '' && !hexPattern.test(value));
                        }}
                        className={`edit-field-sub-input ${colorError ? 'border-red-500' : ''}`}
                        placeholder="#FFFFFF"
                        maxLength={7}
                      />
                    </div>

                    {colorError && (
                      <p className="text-red-500 text-xs mt-1">
                        Invalid color code. Use format #RRGGBB.
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="edit-field">Size</label>
                    <Select
                      value={size}
                      onChange={(value) => setSize(value)}
                      className="edit-field-sub-input w-full"
                      options={[
                        { value: 'S', label: 'Small (S)' },
                        { value: 'M', label: 'Medium (M)' },
                        { value: 'L', label: 'Large (L)' },
                        { value: 'XL', label: 'Extra Large (XL)' }
                      ]}
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  className="self-end mt-6"
                  loading={loading}
                  onClick={async () => {
                    const formData = buildFormData();

                    if (onAction) await onAction(formData);
                  }}
                >
                  {actionLabel}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EditProductModal;
