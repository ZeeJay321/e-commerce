'use client';

import { useState } from 'react';

import { Button, Drawer } from 'antd';

import AuthCard from '@/components/auth-card/auth-card-functionality';
import { FieldConfig, FieldType } from '@/models';

import './form-drawer.css';

const AddCardSidebar = () => {
  const [open, setOpen] = useState(false);

  const fields: FieldConfig[] = [
    {
      name: 'cardNumber',
      label: 'Card Number',
      placeholder: '1234 5678 9012 3456',
      inputType: 'text',
      rules: [{ required: true, message: 'Please enter card number' }]
    },
    {
      name: 'expiry',
      label: 'Expiry Date',
      placeholder: 'MM/YY',
      inputType: 'text',
      rules: [{ required: true, message: 'Please enter expiry date' }]
    },
    {
      name: 'cvc',
      label: 'CVC',
      placeholder: '123',
      inputType: 'password',
      rules: [{ required: true, message: 'Please enter CVC' }]
    }
  ];

  const handleSubmit = (values: FieldType) => {
    console.log('Card Added:', values);
    setOpen(false);
  };

  return (
    <>
      <Button
        className="place-order"
        type="primary"
        size="large"
        block
        onClick={() => setOpen(true)}
      >
        Add Card
      </Button>

      <Drawer
        title="Add New Card"
        placement="right"
        width="50%"
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
        styles={{
          body: { padding: '24px', background: '#fafafa' }
        }}
      >
        <AuthCard
          fields={fields}
          submitText="Save Card"
          onFinish={handleSubmit}
        />
      </Drawer>
    </>
  );
};

export default AddCardSidebar;
