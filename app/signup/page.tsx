'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { FormProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import { FieldConfig, FieldType } from '@/models';
import { signupUser } from '@/redux/slices/user-slice';
import { AppDispatch, RootState } from '@/redux/store';

import './signup.css';

const signupFields: FieldConfig[] = [{
  name: 'fullname',
  label: 'Full Name',
  placeholder: 'Full Name',
  rules: [{ required: true, message: 'Please enter your full name' }],
  inputType: 'text'
}, {
  name: 'email',
  label: 'Email Address',
  placeholder: 'Email Address',
  rules: [
    { required: true, message: 'Please enter your email' },
    { type: 'email', message: 'Enter a valid email address' }
  ],
  inputType: 'text'
}, {
  name: 'mobile',
  label: 'Mobile',
  placeholder: 'Mobile Number',
  rules: [{
    required: true, message: 'Please enter your mobile number'

  }, {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Enter a valid mobile number (e.g. +923001234567)'
  }],
  inputType: 'text'
}, {
  name: 'password',
  label: 'Password',
  placeholder: 'Password',
  rules: [{
    required: true, message: 'Password is required'
  }, {
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
    message:
      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
  }],
  inputType: 'password'
}];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      if (
        !values.fullname
        || !values.email
        || !values.mobile
        || !values.password
        || !values.confirmPassword
      ) {
        setNotification({
          type: 'error',
          message: 'All fields are required'
        });
        return;
      }
      const user = dispatch(
        signupUser({
          fullName: values.fullname,
          email: values.email,
          phoneNumber: values.mobile,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      ).unwrap();

      setNotification({
        type: 'success',
        message: `Welcome, ${(await user).name || 'User'}! Your account has been created.`
      });

      setTimeout(() => {
        setNotification(null);
        router.push('/login');
      }, 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: typeof error === 'string' ? error : 'Signup failed'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
    setNotification({
      type: 'error',
      message: 'Signup failed. Please check the form fields.'
    });
    setTimeout(() => setNotification(null), 3000);
  };

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

      <div className="signup-card">
        <p className="signup-card-text">Signup</p>
        <AuthCard
          fields={signupFields}
          confirmPassword
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          submitText="Signup"
          footer={(
            <p className="text-sm">
              Already have an account?
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
