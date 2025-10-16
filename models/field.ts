import type { Rule } from 'rc-field-form/lib/interface';

export type FieldType = {
  fullname?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  remember?: boolean;

  cardNumber?: string;
  expiry?: string;
  cvc?: string;
};

export type FieldConfig = {
  name: keyof FieldType;
  label: string;
  placeholder: string;
  rules: Rule[];
  inputType?: 'text' | 'password';
};
