'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/loading/loadingspinner';
import ProductGrid from '@/components/productgrid/productgridfunctionality';
import SearchBar from '@/components/searchbar/searchbarfunctionality';
import Sort from '@/components/sort/sortfunctionality';

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
    <div className="cover">
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
