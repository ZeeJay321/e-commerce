'use client';

import type { FormProps } from 'antd';
import {
  Button,
  Checkbox,
  Form, Input
} from 'antd';
import 'antd/dist/reset.css';
import type { Rule } from 'rc-field-form/lib/interface';

export type FieldType = {
  fullname?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  remember?: boolean; // added for checkbox
};

export type FieldConfig = {
  name: keyof FieldType;
  label: string;
  placeholder: string;
  rules: Rule[];
  inputType?: 'text' | 'password';
};

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
      {/* Render all fields */}
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

      {/* Confirm Password (optional) */}
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

      {/* Checkbox (optional) */}
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

      {/* Footer (login link / signup link etc.) */}
      {footer && <div className="form-options">{footer}</div>}
    </Form>
  </div>
);

export default AuthCard;
