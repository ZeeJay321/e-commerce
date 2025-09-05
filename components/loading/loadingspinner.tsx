import React from 'react';

import { Spin } from 'antd';
import 'antd/dist/reset.css';

const contentStyle: React.CSSProperties = {
  padding: 50,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4
};

const content = <div style={contentStyle} />;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen gap-6">
    <Spin tip="Loading" size="large">{content}</Spin>
  </div>
);

export default LoadingSpinner;
