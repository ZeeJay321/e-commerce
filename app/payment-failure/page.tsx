'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import LoadingSpinner from '@/components/loading/loading-spinner';
import './failure.css';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [isLoadPage, setIsLoadPage] = useState(false);

  return (
    <div className="container">

      {((isLoadPage) && (
        <div className="fixed inset-0 bg-white opacity-40 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ))}

      <div className="card">
        <StopOutlined className="icon" twoToneColor="#f5222d" />
        <h1 className="title">Payment Failed</h1>
        <p className="subtitle">
          Your payment was unable to be processed. Please kindly try again
        </p>

        <div className="actions">
          <Button
            onClick={() => {
              router.push('/');
              setIsLoadPage(true);
            }}
            className="buttonOutline"
            type="default"
          >
            Go to Home
          </Button>
          <Button
            onClick={() => {
              router.push('/orders');
              setIsLoadPage(true);
            }}
            className="buttonPrimary"
            type="primary"
          >
            View Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
