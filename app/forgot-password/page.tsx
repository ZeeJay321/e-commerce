'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality'; // ✅ import
import { FieldConfig, FieldType } from '@/models';
import './forgot-password.css';

const forgotFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Enter your email address',
    placeholder: 'Please enter your email',
    rules: [
      { required: true, message: 'Please enter your email address' },
      { type: 'email', message: 'Enter a valid email address' }
    ]
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const res = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setNotif({
        type: 'success',
        message: 'Reset Password Instructions have been sent to your email address.'
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotif({
        type: 'error',
        message
      });
    } finally {
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Forgot Password Failed:', errorInfo);

    // ✅ Error notification
    setNotif({
      type: 'error',
      message: 'Failed to send reset link'
    });

    setTimeout(() => setNotif(null), 3000);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      {/* ✅ Notification */}
      {notif && (
        <CustomNotification
          type={notif.type}
          message={notif.message}
          description={notif.description}
          placement="topRight"
          onClose={() => setNotif(null)}
        />
      )}

      <div className="forgot-card">
        <p className="forgot-card-text">Forgot Password</p>
        <AuthCard
          fields={forgotFields}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitText="Forgot Password"
          footer={(
            <p className="text-sm">
              No, I remember my password!
              {' '}
              <a href="/login" className="form-hrefs">
                Login
              </a>
            </p>
          )}
        />
      </div>
    </div>
  );
};

export default Page;
