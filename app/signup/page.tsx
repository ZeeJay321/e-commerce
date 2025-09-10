'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality'; // ✅ import notif
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
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Signup Success:', values);

    setNotif({
      type: 'success',
      message: 'Awesome, Your order has been placed successfully.'
    });

    setTimeout(() => setNotif(null), 3000);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Signup Failed:', errorInfo);
    setNotif({
      type: 'error',
      message: 'Signup failed'
    });

    setTimeout(() => setNotif(null), 3000);
  };

  useEffect(() => {
    setIsRendered(true);
  }, []);

  if (!isRendered) {
    return <LoadingSpinner />;
  }

  return (
    <div className="cover">
      {/* ✅ Notification */}
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
