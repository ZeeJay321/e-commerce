'use client';

import { useEffect, useState } from 'react';

import { Col, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from '@/components/product-card/product-card-functionality';
import {
  clearProducts,
  fetchNextProducts
} from '@/redux/slices/products-slice';
import {
  type AppDispatch,
  type RootState
} from '@/redux/store';

import './grid.css';

type ProductGridProps = {
  search: string;
  sortOption: string | null;
};

const ProductGrid = ({ search, sortOption }: ProductGridProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items:
    products,
    loading,
    hasMore,
    total,
    error
  } = useSelector((state: RootState) => state.products);

  const limit = 8;
  const [skip, setSkip] = useState(1);

  useEffect(() => {
    dispatch(clearProducts());
    setSkip(1);
    dispatch(fetchNextProducts({
      skip: 1,
      limit,
      query: search,
      sortOption
    }));
  }, [
    dispatch,
    search,
    sortOption
  ]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.page-scroll');
    if (!scrollContainer) {
      return undefined;
    }

    const onScroll = () => {
      if (
        scrollContainer.scrollTop + scrollContainer.clientHeight
        >= scrollContainer.scrollHeight - 1200
        && !loading
        && hasMore
        && products.length !== total
      ) {
        const nextSkip = skip + 1;
        setSkip(nextSkip);
        dispatch(
          fetchNextProducts({
            skip: nextSkip,
            limit,
            query: search,
            sortOption
          })
        );
      }
    };

    scrollContainer.addEventListener('scroll', onScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  }, [
    dispatch,
    loading,
    hasMore,
    skip,
    search,
    products.length,
    total,
    sortOption
  ]);

  return (
    <Row
      className="content-grid"
      gutter={[
        {
          xs: 12, sm: 30, md: 30, lg: 30
        },
        {
          xs: 12, sm: 32, md: 32, lg: 32
        }
      ]}
    >
      {products.map((product) => (
        <Col key={product.id} lg={6} md={8} sm={12} xs={24}>
          <ProductCard product={product} />
        </Col>
      ))}

      {products.length === 0 && !loading && (
        <Col span={24} className="text-center py-6">
          <p>No products found</p>
        </Col>
      )}

      {loading && (
        <Col span={24} className="text-center py-6">
          <p>Loading...</p>
        </Col>
      )}

      {error && (
        <Col span={24} className="text-center py-6 text-red-500">
          <p>{error}</p>
        </Col>
      )}
    </Row>
  );
};

export default ProductGrid;
