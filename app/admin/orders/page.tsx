'use client';

import { useEffect, useState } from 'react';

import {
  CheckSquareOutlined,
  CodeSandboxOutlined,
  PayCircleOutlined
} from '@ant-design/icons';

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
        <div className='box-div'>
          <p className='box-paragraph'>
            <span className='box-first-span'>Total Orders:</span>
            <span className='box-second-span'>12</span>
          </p>
          <div className="icon-div">
            <CheckSquareOutlined className="icon-inside" />
          </div>
        </div>
        <div className='box-div'>
          <p className='box-paragraph'>
            <span className='box-first-span'>Total Unit:</span>
            <span className='box-second-span'>43</span>
          </p>
          <div className="icon-div">
            <CodeSandboxOutlined className="icon-inside" />
          </div>
        </div>
        <div className='box-div'>
          <p className='box-paragraph'>
            <span className='box-first-span'>Total Amount:</span>
            <span className='box-second-span'>$100,000</span>
          </p>
          <div className="icon-div">
            <PayCircleOutlined className="icon-inside" />
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
