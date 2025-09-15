'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality';
import './signup.css';

const signupFields: FieldConfig[] = [
  {
    name: 'fullname',
    label: 'Full Name',
    placeholder: 'Full Name',
    rules: [{ required: true, message: 'Please enter your full name' }],
    inputType: 'text'
  },
  {
    name: 'email',
    label: 'Email Address',
    placeholder: 'Email Address',
    rules: [
      { required: true, message: 'Please enter your email' },
      { type: 'email', message: 'Enter a valid email address' }
    ],
    inputType: 'text'
  },
  {
    name: 'mobile',
    label: 'Mobile',
    placeholder: 'Mobile Number',
    rules: [
      { required: true, message: 'Please enter your mobile number' },
      {
        pattern: /^\+?[1-9]\d{1,14}$/,
        message: 'Enter a valid mobile number (e.g. +923001234567)'
      }
    ],
    inputType: 'text'
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Password',
    rules: [
      { required: true, message: 'Password is required' },
      {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
      }
    ],
    inputType: 'password'
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

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
          fullname: values.fullname,
          email: values.email,
          phoneNumber: values.mobile,
          password: values.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setNotif({
        type: 'success',
        message: 'Signup successful!',
        description: 'Your account has been created successfully.'
      });

      setTimeout(() => setNotif(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotif({
        type: 'error',
        message
      });
      setTimeout(() => setNotif(null), 3000);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    setNotif({
      type: 'error',
      message: 'Signup failed. Please check the form fields.'
    });
    setTimeout(() => setNotif(null), 3000);
  };

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
              <a href="/login" className="form-hrefs">Login</a>
            </p>
          )}
        />
      </div>
    </div>
  );
};

export default Page;
