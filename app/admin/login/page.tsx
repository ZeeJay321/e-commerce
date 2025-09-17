'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import { signIn } from 'next-auth/react';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import './login.css';

import { FieldConfig, FieldType } from '@/models';

const loginFields: FieldConfig[] = [{
  name: 'email',
  label: 'Enter email address',
  placeholder: 'Please enter your email',
  rules: [{
    required: true, message: 'Email is required'
  }, {
    type: 'email', message: 'Please enter a valid email address'
  }]
}, {
  name: 'password',
  label: 'Password',
  placeholder: 'Please enter password',
  rules: [{ required: true, message: 'Please input your password' }],
  inputType: 'password'
}];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const remember = values.remember ?? false;

    const result = await signIn('Admin', {
      redirect: false,
      email: values.email,
      password: values.password,
      remember
    });

    if (result?.error) {
      setNotification({
        type: 'error',
        message: 'Wrong username password, please enter correct credentials'
      });
    } else {
      setNotification({
        type: 'success',
        message: 'Login Successful'
      });

      setTimeout(() => {
        window.location.href = '/admin/home';
      }, 1200);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
    setNotification({
      type: 'error',
      message: 'Please fill in all required fields correctly'
    });
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
      <div className="login-card">
        <p className="login-card-text">Login</p>
        <AuthCard
          fields={loginFields}
          checkbox={{ name: 'remember', label: 'Remember me' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitText="Login"
        />
      </div>
    </div>
  );
};

export default Page;
