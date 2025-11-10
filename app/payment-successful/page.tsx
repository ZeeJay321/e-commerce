'use client';

import { useRouter } from 'next/navigation';

import { CheckCircleTwoTone } from '@ant-design/icons';
import { Button } from 'antd';
import './success.css';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="container">
      <div className="card">
        <CheckCircleTwoTone className="icon" twoToneColor="#52c41a" />
        <h1 className="title">Payment Successful 🎉</h1>
        <p className="subtitle">
          Your payment has been processed successfully. Thank you for your purchase!
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
