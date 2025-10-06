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

  const formattedQuantity = quantity.toString().padStart(2, '0');

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
            <p className="text-card-price text-sm font-bold">
              Price:
              <span className="card-description">
                $
                {product.price.toFixed(2)}
              </span>
            </p>
          )}
          title={<p className="card-text">{product.title}</p>}
        />
        <div className="card-buttons">
          <div className="card-buttons-div">
            <Button size="small" onClick={decrease} disabled={quantity <= 1}>
              -
            </Button>
            <span className="card-buttons-span">{formattedQuantity}</span>
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
