'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import {
  Button,
  Card,
  Select
} from 'antd';

import {
  CartItem,
  Product,
  ProductVariant
} from '@/models';

import CustomNotification from '../notifications/notifications-functionality';

import './card.css';

const { Meta } = Card;
const { Option } = Select;

const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const colors = useMemo(
    () => Array.from(
      new Map(product.variants.map((v) => [v.colorCode, v])).values()
    ),
    [product.variants]
  );

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0].colorCode);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);

  const currentVariant = useMemo<ProductVariant | undefined>(() => product.variants.find(
    (v) => v.colorCode === selectedColor && v.size === selectedSize
  ), [product.variants, selectedColor, selectedSize]);

  const increase = () => {
    if (!currentVariant) return;
    setQuantity((prev) => (prev < currentVariant.stock ? prev + 1 : prev));
  };

  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    if (!currentVariant) return;
    if (currentVariant.stock <= 0) {
      setNotification({
        type: 'error',
        message: `${product.title} is out of stock!`
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const existingCart = localStorage.getItem('cartData');
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    const index = cart.findIndex(
      (item) => item.id === product.id
        && item.colorcode === currentVariant.colorCode
        && item.size === currentVariant.size
    );

    if (index >= 0) {
      const newQty = cart[index].qty + quantity;

      if (newQty > currentVariant.stock) {
        setNotification({
          type: 'error',
          message: `You cannot add more of this item: ${product.title}`
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      cart[index].qty = newQty;
    } else {
      const newItem: CartItem = {
        img: currentVariant.img,
        id: product.id,
        variantId: currentVariant.id,
        product: product.title,
        colorcode: currentVariant.colorCode,
        color: currentVariant.color,
        size: currentVariant.size,
        qty: Math.min(quantity, currentVariant.stock),
        stock: currentVariant.stock,
        price: currentVariant.price
      };
      cart.push(newItem);
    }

    localStorage.setItem('cartData', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setNotification({
      type: 'success',
      message: `${product.title} added to cart!`
    });

    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <Card
      hoverable
      className="content-grid-card"
      cover={(
        <Image
          alt={product.title}
          className="card-image"
          height={222}
          src={currentVariant?.img ?? '/images/default.png'}
          width={257}
        />
      )}
      styles={{
        body: { padding: 0 }
      }}
    >
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}

      <div className="meta-content">
        <Meta
          title={<p className="card-text">{product.title}</p>}
          description={(
            <div className="flex flex-col items-start justify-between">
              <p className="text-card-price text-sm font-bold">
                Price:
                {' '}
                <span className="card-description">
                  $
                  {currentVariant?.price.toFixed(2) ?? '--'}
                </span>
              </p>

              <div className="flex justify-around item-center text-center gap-8">
                <div className="flex flex-col text-left">
                  <span className="text-card-price text-sm font-bold mb-1">
                    Size:
                  </span>
                  <Select
                    size="small"
                    value={selectedSize}
                    onChange={setSelectedSize}
                    style={{ width: 80 }}
                  >
                    {sizes.map((size) => (
                      <Option key={size} value={size}>
                        {size}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-card-price text-sm font-bold mb-1">
                    Color:
                  </span>
                  <Select
                    size="small"
                    value={selectedColor}
                    onChange={setSelectedColor}
                    style={{ width: 100 }}
                    optionLabelProp="label"
                  >
                    {colors.map((variant) => (
                      <Option
                        key={variant.colorCode}
                        value={variant.colorCode}
                        label={variant.color}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="cart-color-span"
                            style={{
                              backgroundColor: variant.colorCode,
                              display: 'inline-block',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%'
                            }}
                          />
                          {variant.color}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}
        />

        <div className="card-buttons">
          <div className="card-buttons-div">
            <Button size="small" onClick={decrease} disabled={quantity <= 1}>
              -
            </Button>
            <span
              contentEditable
              role="textbox"
              tabIndex={0}
              aria-label="Edit quantity"
              suppressContentEditableWarning
              className="card-buttons-span px-2"
              onBlur={(e) => {
                const text = e.currentTarget.textContent?.trim() || '1';
                let newQty = Number(text);
                if (Number.isNaN(newQty) || newQty < 1) newQty = 1;
                if (currentVariant && newQty > currentVariant.stock) newQty = currentVariant.stock;
                setQuantity(newQty);
                e.currentTarget.textContent = newQty.toString().padStart(2, '0');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {quantity}
            </span>
            <Button
              size="small"
              onClick={increase}
              disabled={currentVariant ? quantity >= currentVariant.stock : true}
            >
              +
            </Button>
          </div>

          <Button
            type="primary"
            onClick={addToCart}
            disabled={!currentVariant || currentVariant.stock <= 0}
            className="add-to-cart"
          >
            {currentVariant?.stock && currentVariant.stock > 0
              ? 'Add to Cart'
              : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
