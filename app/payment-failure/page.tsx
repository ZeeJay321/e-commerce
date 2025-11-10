'use client';

import { useRouter } from 'next/navigation';

import { StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './failure.css';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="container">
      <div className="card">
        <StopOutlined className="icon" twoToneColor="#f5222d" />
        <h1 className="title">Payment Failed</h1>
        <p className="subtitle">
          Your payment was unable to be processed. Please kindly try again
        </p>

        <div className="actions">
          <Button
            onClick={() => router.push('/')}
            className="buttonOutline"
            type="default"
          >
            Go to Home
          </Button>
          <Button
            onClick={() => router.push('/orders')}
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
