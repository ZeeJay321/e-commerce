import { FieldConfig } from '@/components/authcard/authcardfunctionality';

export const forgotFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Enter your email address',
    placeholder: 'Please enter your email',
    rules: [
      { required: true, message: 'Please enter your email address' },
      { type: 'email', message: 'Enter a valid email address' }
    ]
  }
];
