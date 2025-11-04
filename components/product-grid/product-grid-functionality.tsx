'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Col,
  Row,
  Spin
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from '@/components/product-card/product-card-functionality';
import {
  clearProducts,
  fetchNextProducts,
  fetchPrevProducts,
  removeProducts
} from '@/redux/slices/products-slice';
import { type AppDispatch, type RootState } from '@/redux/store';
import './grid.css';

type ProductGridProps = {
  search: string;
  sortOption: string | null;
};

const MAX_PRODUCTS = 40;
const LIMIT = 8;

const ProductGrid = ({ search, sortOption }: ProductGridProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items:
    products,
    loading,
    total,
    error
  } = useSelector(
    (state: RootState) => state.products
  );

  const [nextPage, setNextPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const [topLoading, setTopLoading] = useState(false);

  const isFetching = useRef(false);

  useEffect(() => {
    dispatch(clearProducts());
    setNextPage(1);
    setPrevPage(1);
    dispatch(
      fetchNextProducts({
        skip: 1,
        limit: LIMIT,
        query: search,
        sortOption
      })
    );
  }, [
    dispatch,
    search,
    sortOption
  ]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.page-scroll');
    if (!scrollContainer) return () => { };

    let scrollTimeout: NodeJS.Timeout | null = null;

    const onScroll = async () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(async () => {
        if (isFetching.current || loading) return;

        const { scrollTop, clientHeight, scrollHeight } = scrollContainer;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 3200;
        const nearTop = scrollTop < 100;

        if (nearBottom && nextPage * LIMIT < total) {
          isFetching.current = true;
          const newNext = nextPage + 1;
          setNextPage(newNext);

          await dispatch(
            fetchNextProducts({
              skip: newNext,
              limit: LIMIT,
              query: search,
              sortOption
            })
          );

          if ((newNext - prevPage) * LIMIT >= MAX_PRODUCTS) {
            setPrevPage((p) => p + 1);
            dispatch(removeProducts({ count: LIMIT, from: 'start' }));
          }

          isFetching.current = false;
        }

        if (nearTop && prevPage > 1) {
          isFetching.current = true;
          setTopLoading(true);

          const prevScrollHeight = scrollContainer.scrollHeight;
          const prevScrollTop = scrollContainer.scrollTop;

          const newPrev = prevPage - 1;
          setPrevPage(newPrev);

          await dispatch(
            fetchPrevProducts({
              skip: newPrev,
              limit: LIMIT,
              query: search,
              sortOption
            })
          );

          requestAnimationFrame(() => {
            const newScrollHeight = scrollContainer.scrollHeight;
            scrollContainer.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
            scrollContainer.scrollBy({ top: 800, behavior: 'smooth' });
          });

          if ((nextPage - newPrev) * LIMIT >= MAX_PRODUCTS) {
            setNextPage((n) => n - 1);
            dispatch(removeProducts({ count: LIMIT, from: 'end' }));
          }

          setTopLoading(false);
          isFetching.current = false;
        }
      }, 200);
    };

    scrollContainer.addEventListener('scroll', onScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [
    dispatch,
    loading,
    nextPage,
    prevPage,
    total,
    search,
    sortOption
  ]);

  return (
    <div>
      {topLoading && (
        <div
          className='text-center p-5'
        >
          <Spin />
        </div>
      )}

      <Row
        className="content-grid"
        gutter={[{
          xs: 12, sm: 30, md: 30, lg: 30
        }, {
          xs: 12, sm: 32, md: 32, lg: 32
        }]}
      >
        {products.map((product) => (
          <Col key={product.id} lg={6} md={8} sm={12} xs={24}>
            <ProductCard product={product} />
          </Col>
        ))}

        {/* Bottom loader */}
        {loading && !topLoading && (
          <Col span={24} className="text-center py-6">
            <Spin />
          </Col>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <Col span={24} className="text-center py-6">
            <p>No products found</p>
          </Col>
        )}

        {/* Error */}
        {error && (
          <Col span={24} className="text-center py-6 text-red-500">
            <p>{error}</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ProductGrid;
