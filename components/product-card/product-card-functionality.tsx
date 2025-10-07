'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button, Card } from 'antd';

import { CartItem, Product } from '@/models';

import CustomNotification from '../notifications/notifications-functionality';

import './card.css';

const { Meta } = Card;

const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const increase = () => {
    setQuantity((prev) => (prev < product.stock ? prev + 1 : prev));
  };

  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    if (product.stock <= 0) {
      setNotification({
        type: 'error',
        message: `${product.title} is out of stock!`
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const existingCart = localStorage.getItem('cartData');
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    const index = cart.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      const newQty = cart[index].qty + quantity;

      if (newQty > product.stock) {
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
        img: product.img,
        id: product.id,
        product: product.title,
        colorcode: product.colorCode,
        color: product.color,
        size: product.size,
        qty: Math.min(quantity, product.stock),
        stock: product.stock,
        price: product.price
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
          src={product.img}
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
          description={(
            <div className='flex flex-col items-start justify-between'>
              <p className="text-card-price text-sm font-bold">
                Price:
                <span className="card-description">
                  $
                  {product.price.toFixed(2)}
                </span>
              </p>
              <span className="font-display text-xs mb-3.5">
                <span className='text-card-price text-sm font-bold'>
                  Size:
                  <span className='card-description'>
                    {product.size}
                  </span>
                </span>

              </span>
              <div className="cart-color mb-3.5">
                <span className='text-card-price text-sm font-bold'>Color:</span>
                <span
                  className="cart-color-span"
                  style={{ backgroundColor: product.colorCode }}
                />
                <span className="card-description">{product.color}</span>
              </div>
            </div>
          )}
          title={<p className="card-text">{product.title}</p>}
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
              className="card-buttons-span outline-none border rounded-md px-2"
              onBlur={(e) => {
                const text = e.currentTarget.textContent?.trim() || '1';
                let newQty = Number(text);
                if (Number.isNaN(newQty) || newQty < 1) newQty = 1;
                if (newQty > product.stock) newQty = product.stock;
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
              disabled={quantity >= product.stock}
            >
              +
            </Button>
          </div>
          <Button
            type="primary"
            onClick={addToCart}
            disabled={product.stock <= 0}
            className='add-to-cart'
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
