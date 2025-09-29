'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import { useDispatch, useSelector } from 'react-redux';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import './login.css';

import { FieldConfig, FieldType } from '@/models';
import { loginUser } from '@/redux/slices/user-slice';
import { AppDispatch, RootState } from '@/redux/store';

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
  const [isNextPage, setIsNextPage] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.user);
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    if (!values.email || !values.password) {
      setNotification({
        type: 'error',
        message: 'Email and password are required'
      });
      return;
    }

    try {
      const user = await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
          remember: values.remember ?? false
        })
      ).unwrap(); // throws if rejected

      setNotification({
        type: 'success',
        message: 'Login Successful'
      });

      setIsNextPage(true);

      setTimeout(() => {
        window.location.href = user.role === 'admin' ? '/admin/products' : '/';
      }, 1200);
    } catch (err) {
      setNotification({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Wrong username or password, please enter correct credentials'
      });
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
      {(loading || isNextPage) && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      <div className="login-card">
        <p className="login-card-text">Login</p>
        <AuthCard
          fields={loginFields}
          checkbox={{ name: 'remember', label: 'Remember me' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitText="Login"
          footer={(
            <>
              <p className="text-sm pb-4">
                Forgot password?
                {' '}
                <a href="/forgot-password" className="form-hrefs">
                  Reset
                </a>
              </p>
              <p className="text-sm">
                I don’t have an account?
                {' '}
                <a href="/signup" className="form-hrefs">
                  Signup
                </a>
              </p>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default Page;
