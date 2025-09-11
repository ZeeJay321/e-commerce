'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button, Card } from 'antd';

import CustomNotification from '../notifications/notificationsfunctionality';
import './card.css';

const { Meta } = Card;

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  colorcode: string;
  size: string;
};

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

const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const formattedQuantity = quantity.toString().padStart(2, '0');

  const addToCart = () => {
    const existingCart = localStorage.getItem('cartData');
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    const index = cart.findIndex((item) => item.key === product.id);
    if (index >= 0) {
      cart[index].qty += quantity;
    } else {
      const newItem: CartItem = {
        img: product.image,
        key: product.id,
        product: product.name,
        colorcode: product.colorcode,
        color: product.color,
        size: product.size,
        qty: quantity,
        price: product.price
      };
      cart.push(newItem);
    }

    localStorage.setItem('cartData', JSON.stringify(cart));
    setNotif({
      type: 'success',
      message: `${product.name} added to cart!`
    });

    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <Card
      hoverable
      className="content-grid-card"
      cover={(
        <Image
          alt={product.name}
          className="card-image"
          height={222}
          src={product.image}
          width={257}
        />
      )}
      styles={{
        body: { padding: 0 }
      }}
    >
      {notif && (
        <CustomNotification
          type={notif.type}
          message={notif.message}
          description={notif.description}
          placement="topRight"
          onClose={() => setNotif(null)}
        />
      )}
      <div className="meta-content">
        <Meta
          description={(
            <p className="text-card-price text-sm font-bold">
              Price:
              <span className="card-description">
                $
                {product.price}
              </span>
            </p>
          )}
          title={<p className="card-text">{product.name}</p>}
        />
        <div className="card-buttons">
          <div className="card-buttons-div">
            <Button size="small" onClick={decrease}>
              -
            </Button>
            <span className="card-buttons-span">{formattedQuantity}</span>
            <Button size="small" onClick={increase}>
              +
            </Button>
          </div>
          <Button type="primary" onClick={addToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
