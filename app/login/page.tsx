'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import './login.css';

const loginFields: FieldConfig[] = [
  {
    name: 'username',
    label: 'Enter email address',
    placeholder: 'Please enter your email',
    rules: [{ required: true, message: 'Enter a valid email address' }]
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Please enter password',
    rules: [{ required: true, message: 'Please input your password' }],
    inputType: 'password'
  }
];

const Page = () => {
  const [isRendered, setIsRendered] = useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Login Success:', values);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Login Failed:', errorInfo);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
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
              <p className="text-sm">
                Forgot password?
                {' '}
                <a href="/forgotpassword" className="form-hrefs">
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
