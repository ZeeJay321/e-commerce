import { FieldConfig } from '@/components/authcard/authcardfunctionality';

export const signupFields: FieldConfig[] = [
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
