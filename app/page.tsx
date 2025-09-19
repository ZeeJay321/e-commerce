'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/loading/loading-spinner';
import ProductGrid from '@/components/product-grid/product-grid-functionality';
import SearchBar from '@/components/search-bar/search-bar-functionality';
import Sort from '@/components/sort/sort-functionality';

import 'antd/dist/reset.css';
import './globals.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string | null>(null);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-scroll">
      <div className="content-div">
        <span className="content-paragraph">Our Products</span>
        <div className="content-features w-full">
          <SearchBar onSearch={setSearch} />
          <Sort onChange={setSortOption} />
        </div>
      </div>

      <ProductGrid search={search} sortOption={sortOption} />
    </div>
  );
};

export default Page;
