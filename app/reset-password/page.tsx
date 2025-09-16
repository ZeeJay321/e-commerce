'use client';

import {
  Suspense,
  useEffect,
  useState
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { FormProps } from 'antd';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import { FieldConfig, FieldType } from '@/models';

import './reset-password.css';

const resetFields: FieldConfig[] = [{
  name: 'password',
  label: 'Enter new password',
  placeholder: 'Enter new password',
  rules: [
    { required: true, message: 'Please enter your new password' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
    }
  ],
  inputType: 'password'
}];

// 🔹 This one contains your actual logic
function ResetPasswordPage() {
  const [isRendered, setIsRendered] = useState(false);
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setNotif({
        type: 'success',
        message: 'Your password has been updated. You can now log in.'
      });

      setTimeout(() => {
        setNotif(null);
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotif({
        type: 'error',
        message
      });
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
    setNotif({
      type: 'error',
      message: 'Password reset failed. Please check fields.'
    });
    setTimeout(() => setNotif(null), 3000);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  return (
    <div className="cover">
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
        <p className="forgot-card-text">Reset Password</p>
        <AuthCard
          fields={resetFields}
          confirmPassword
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitText="Reset Password"
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
