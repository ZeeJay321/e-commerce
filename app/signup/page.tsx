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
  placeholder: 'Enter your full name e.g (Zain Jillani)',
  rules: [
    { required: true, message: 'Full name is required' },
    {
      pattern: /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/,
      message: 'Full name must start with capital letters and contain only letters'
    }
  ],
  inputType: 'text'
}, {
  name: 'email',
  label: 'Email Address',
  placeholder: 'Enter your email address e.g (zain.ul.abidin@qbatch.com)',
  rules: [
    { required: true, message: 'Email address is required' },
    { type: 'email', message: 'Email address must be valid' }
  ],
  inputType: 'text'
}, {
  name: 'mobile',
  label: 'Mobile',
  placeholder: 'Enter your Mobile Number e.g (+923123456789)',
  rules: [{
    required: true, message: 'Mobile number is required'

  }, {
    pattern: /^\+?[1-9]\d{9,14}$/,
    message: 'Enter a valid mobile number (e.g. +923001234567)'
  }],
  inputType: 'text'
}, {
  name: 'password',
  label: 'Password',
  placeholder: 'Enter your Password',
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
  const [isNextPage, setIsNextPage] = useState(false);
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

      setIsNextPage(true);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: typeof error === 'string' ? error : 'Signup failed'
      });
    }
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

      {(loading) && (
        <div className="fixed inset-0 bg-white opacity-50 z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {(isNextPage) && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="signup-card">
        <p className="signup-card-text">Signup</p>
        <AuthCard
          fields={signupFields}
          confirmPassword
          onFinish={onFinish}
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
