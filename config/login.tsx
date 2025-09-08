import { FieldConfig } from '@/components/authcard/authcardfunctionality';

export const loginFields: FieldConfig[] = [
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

export const loginCheckbox = {
  name: 'remember',
  label: 'Remember me'
};
