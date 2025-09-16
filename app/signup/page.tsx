'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { FormProps } from 'antd';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import LoadingSpinner from '@/components/loading/loading-spinner';
import CustomNotification from '@/components/notifications/notifications-functionality';

import { FieldConfig, FieldType } from '@/models';

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
  rules: [{
    required: true, message: 'Please enter your email'
  }, {
    type: 'email', message: 'Enter a valid email address'
  }],
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
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
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

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) return <LoadingSpinner />;

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullname,
          email: values.email,
          phoneNumber: values.mobile,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setNotification({
        type: 'success',
        message: 'Your account has been created successfully.'
      });

      setTimeout(() => {
        setNotification(null);
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotification({
        type: 'error',
        message
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
