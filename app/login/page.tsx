'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';
import { signIn } from 'next-auth/react';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality';
import './login.css';

const loginFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Enter email address',
    placeholder: 'Please enter your email',
    rules: [
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ]
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
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });

    if (result?.error) {
      setNotif({
        type: 'error',
        message: 'Wrong username password, please enter correct credentials'
      });
    } else {
      setNotif({
        type: 'success',
        message: 'Login Successful'
      });

      setTimeout(() => {
        window.location.href = result?.url ?? '/';
      }, 1200);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = () => {
    setNotif({
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
      {notif && (
        <CustomNotification
          type={notif.type}
          message={notif.message}
          description={notif.description}
          placement="topRight"
          onClose={() => setNotif(null)}
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
          footer={(
            <>
              <p className="text-sm pb-4">
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
