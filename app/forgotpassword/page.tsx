'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import './forgotpassword.css';

const forgotFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Enter your email address',
    placeholder: 'Please enter your email',
    rules: [
      { required: true, message: 'Please enter your email address' },
      { type: 'email', message: 'Enter a valid email address' }
    ]
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Forgot Password request:', values);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Forgot Password Failed:', errorInfo);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
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
