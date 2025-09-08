import { FieldConfig } from '@/components/authcard/authcardfunctionality';

export const resetFields: FieldConfig[] = [
  {
    name: 'password',
    label: 'Enter new password',
    placeholder: 'Enter new password',
    rules: [{ required: true, message: 'Please enter your new password' }],
    inputType: 'password'
  }
];
