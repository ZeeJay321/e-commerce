'use client';

import { useEffect, useState } from 'react';

import { Button } from 'antd';

import LoadingSpinner from '@/components/loading/loading-spinner';

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
        <span className="content-paragraph">Our Products</span>
        <div className="content-features w-full">
          <Button type="default" className="px-4 py-1.5">
            + Add a Single Product
          </Button>
          <Button type="primary" className="px-4 py-1.5">
            + Add Multiple Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
