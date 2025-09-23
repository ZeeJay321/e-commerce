'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/loading/loading-spinner';

import AdminOrdersTable from '@/components/admin-orders/admin-order-functionality';
import SearchBar from '@/components/search-bar/search-bar-functionality';
import 'antd/dist/reset.css';
import './home.css';

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      <div className="content-div">
        <span className="content-paragraph">Orders</span>
        <div className="content-features w-full">
          <SearchBar onSearch={setSearch} />
        </div>
      </div>
      <AdminOrdersTable />
    </div>
  );
};

export default Page;
