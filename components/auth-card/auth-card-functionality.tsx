'use client';

import type { FormProps } from 'antd';

import {
  Button,
  Checkbox,
  Form,
  Input
} from 'antd';

import 'antd/dist/reset.css';
import './auth-card.css';

import { FieldConfig, FieldType } from '@/models';

type AuthCardProps = {
  fields: FieldConfig[];
  confirmPassword?: boolean;
  checkbox?: { name: keyof FieldType; label: string };
  onFinish?: FormProps<FieldType>['onFinish'];
  onFinishFailed?: FormProps<FieldType>['onFinishFailed'];
  submitText?: string;
  footer?: React.ReactNode; // optional custom footer

};

const AuthCard = ({
  fields,
  confirmPassword = false,
  checkbox,
  onFinish,
  onFinishFailed,
  submitText = 'Submit',
  footer
}: AuthCardProps) => (
  <div className="inner">
    <Form
      layout="vertical"
      autoComplete="off"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      className="ant-form-now"
    >
      {fields.map((field) => (
        <Form.Item<FieldType>
          key={field.name}
          label={field.label}
          name={field.name}
          rules={field.rules}
        >
          {field.inputType === 'password' ? (
            <Input.Password placeholder={field.placeholder} />
          ) : (
            <Input placeholder={field.placeholder} />
          )}
        </Form.Item>
      ))}

      {confirmPassword && (
        <Form.Item<FieldType>
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('Passwords do not match'));
              }
            })
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
      )}

      {checkbox && (
        <Form.Item<FieldType> name={checkbox.name} valuePropName="checked">
          <Checkbox>{checkbox.label}</Checkbox>
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {submitText}
        </Button>
      </Form.Item>

      {footer && <div className="form-options">{footer}</div>}
    </Form>
  </div>
);

export default AuthCard;
