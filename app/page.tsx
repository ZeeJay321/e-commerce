'use client';

import { useEffect, useState } from 'react';

import ProductGrid from '@/components/productgrid/productgridfunctionality';
import SearchBar from '@/components/searchbar/searchbarfunctionality';
import Sort from '@/components/sort/sortfunctionality';

import LoadingSpinner from '@/components/loading/loadingspinner';
import 'antd/dist/reset.css';
import './globals.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      <div className="content-div">
        <p className="content-paragraph">Our Products</p>
        <div className="content-features">
          <SearchBar />
          <Sort />
        </div>
      </div>
      <ProductGrid />
    </div>
  );
};

export default Page;
