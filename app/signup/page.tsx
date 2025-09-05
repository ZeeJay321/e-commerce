'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
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
    rules: [{ required: true, message: 'Please enter your mobile number' }],
    inputType: 'text'
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Password',
    rules: [{ required: true, message: 'Please enter your password' }],
    inputType: 'password'
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Signup Success:', values);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Signup Failed:', errorInfo);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
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
