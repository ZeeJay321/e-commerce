'use client';

import { useEffect, useState } from 'react';

import type { FormProps } from 'antd';

import AuthCard, { FieldConfig, FieldType } from '@/components/authcard/authcardfunctionality';
import LoadingSpinner from '@/components/loading/loadingspinner';
import CustomNotification from '@/components/notifications/notificationsfunctionality'; // ✅ import
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
  const [notif, setNotif] = useState<{
    type: 'success' | 'error';
    message: string;
    description?: string;
  } | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Reset Password request:', values);

    setNotif({
      type: 'success',
      message: 'Your password has been updated.  Please check your email.'
    });

    setTimeout(() => setNotif(null), 3000);
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Reset Password Failed:', errorInfo);

    setNotif({
      type: 'error',
      message: 'Password reset failed'
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
