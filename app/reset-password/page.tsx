'use client';

import {
  Suspense,
  useEffect,
  useState
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { FormProps } from 'antd';

import { useDispatch, useSelector } from 'react-redux';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import { FieldConfig, FieldType } from '@/models';

import './reset-password.css';

import { resetPassword } from '@/redux/slices/user-slice';
import { AppDispatch, RootState } from '@/redux/store';

const resetFields: FieldConfig[] = [{
  name: 'password',
  label: 'Enter new password',
  placeholder: 'Enter new password',
  rules: [{
    required: true, message: 'Please enter your new password'
  }, {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
  }],
  inputType: 'password'
}];

function ResetPasswordPage() {
  const [isRendered, setIsRendered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      if (
        !token
        || !values.password
        || !values.confirmPassword
      ) {
        setNotification({
          type: 'error',
          message: 'Both fields are required'
        });
        return;
      }
      const message = await dispatch(
        resetPassword({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      ).unwrap();

      setNotification({ type: 'success', message });

      setTimeout(() => {
        setNotification(null);
        router.push('/login');
      }, 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: typeof err === 'string' ? err : 'Password reset failed'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
    setNotification({
      type: 'error',
      message: 'Password reset failed. Please check fields.'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  return (
    <div className="cover">
      {notification && (
        <CustomNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          placement="topRight"
          onClose={() => setNotification(null)}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
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
