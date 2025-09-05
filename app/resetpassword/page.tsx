'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import './resetpassword.css';

const resetFields: FieldConfig[] = [
  {
    name: 'password',
    label: 'Enter new password',
    placeholder: 'Enter new password',
    rules: [{ required: true, message: 'Please enter your new password' }],
    inputType: 'password'
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Reset Password request:', values);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
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
};

export default Page;
