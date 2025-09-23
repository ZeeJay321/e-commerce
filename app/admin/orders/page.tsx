'use client';

import { useEffect, useState } from 'react';

import { CheckSquareOutlined } from '@ant-design/icons';

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

  console.log(search);

  return (
    <div className="cover">
      <div className='content-boxes'>
        <div className='flex p-4 border w-full max-w-200 text-box-color'>
          <p className='flex flex-col justify-between gap-2 w-full max-w-150 h-full max-h-22 !m-0'>
            <span className='text-black font-medium text-[14px]'>Total Orders:</span>
            <span className='text-nav-text font-bold text-xl'>12</span>
          </p>
          <div className="flex items-center justify-center w-12 h-12 rounded-3xl bg-blue-100">
            <CheckSquareOutlined className="!text-nav-text text-lg" />
          </div>
        </div>
        <div className='flex p-4 border w-full max-w-200 text-box-color'>
          <p className='flex flex-col !justify-between gap-2 w-full max-w-150 h-full max-h-22 !m-0'>
            <span className='text-black font-medium text-[14px]'>Total Unit:</span>
            <span className='text-nav-text font-bold text-xl'>43</span>
          </p>
          <div className="flex items-center justify-center w-12 h-12 rounded-3xl bg-blue-100">
            <CheckSquareOutlined className="!text-nav-text text-lg" />
          </div>
        </div>
        <div className='flex p-4 border w-full max-w-200 text-box-color'>
          <p className='flex flex-col justify-between gap-2 w-full max-w-150 h-full max-h-22 !m-0'>
            <span className='text-black font-medium text-[14px]'>Total Amount:</span>
            <span className='text-nav-text font-bold text-xl'>$100,000</span>
          </p>
          <div className="flex items-center justify-center w-12 h-12 rounded-3xl bg-blue-100">
            <CheckSquareOutlined className="!text-nav-text text-lg" />
          </div>
        </div>
      </div>
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
