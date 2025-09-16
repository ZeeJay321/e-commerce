import React, { useEffect } from 'react';

import type { NotificationArgsProps } from 'antd';
import { notification } from 'antd';
import './notif.css';

type NotificationPlacement = NotificationArgsProps['placement'];

type CustomNotificationProps = {
  type?: 'success' | 'error';
  message: string;
  description?: string;
  placement?: NotificationPlacement;
  duration?: number;
  onClose?: () => void; // 🔑 new prop
};

const CustomNotification: React.FC<CustomNotificationProps> = ({
  type = 'success',
  message,
  description,
  placement = 'topRight',
  duration = 3,
  onClose
}) => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    api.open({
      message: (
        <span className={type === 'success' ? 'text-success-layout' : 'text-failure-layout'}>
          {message}
        </span>
      ),
      description: description && <span>{description}</span>,
      placement,
      duration,
      className: type === 'success' ? 'notif-success' : 'notif-failure',
      onClose
    });
  }, [api, message, description, placement, duration, type, onClose]);

  return contextHolder;
};

export default CustomNotification;
