'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import { useDispatch, useSelector } from 'react-redux';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import { FieldConfig, FieldType } from '@/models';

import './forgot-password.css';

import { forgotPassword } from '@/redux/slices/user-slice';
import { AppDispatch, RootState } from '@/redux/store';

const forgotFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Enter your email address',
    placeholder: 'Please enter your email',
    rules: [{
      required: true, message: 'Please enter your email address'
    }, {
      type: 'email', message: 'Enter a valid email address'
    }]
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      if (!values.email
      ) {
        setNotification({
          type: 'error',
          message: 'Email is required'
        });
        return;
      }
      const message = await dispatch(forgotPassword({ email: values.email })).unwrap();

      setNotification({
        type: 'success',
        message
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: typeof err === 'string' ? err : 'Failed to send reset link'
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    setNotification({
      type: 'error',
      message: 'Failed to send reset link'
    });

    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

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
