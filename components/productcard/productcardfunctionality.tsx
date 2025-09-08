'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button, Card } from 'antd';

const { Meta } = Card;

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const formattedQuantity = quantity.toString().padStart(2, '0');

  return (
    <Card
      hoverable
      className='content-grid-card'
      cover={
        (
          <Image
            alt={product.name}
            className='card-image'
            height={200}
            src={product.image}
            width={200}
          />
        )
      }
      styles={{
        body: {
          padding: 0
        }
      }}
    >
      <div className='meta-content'>
        <Meta
          description={
            (
              <p className='text-card-price text-sm'>
                Price:
                <span className='card-description'>
                  $
                  {product.price}
                </span>
              </p>
            )
          }
          title={
            (
              <p className='card-text'>
                {product.name}
              </p>
            )
          }
        />

        <div className='card-buttons'>
          <div className='card-buttons-div'>
            <Button
              className='card-buttons-layout'
              size='small'
              onClick={decrease}
            >
              -
            </Button>
            <span className='card-buttons-span'>
              {formattedQuantity}
            </span>
            <Button
              className='card-buttons-layout'
              size='small'
              onClick={increase}
            >
              +
            </Button>
          </div>
          <Button
            className='add-to-cart'
            style={{ padding: 0 }}
            type='primary'
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
