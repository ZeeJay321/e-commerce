'use client';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Select } from 'antd';

import './sort.css';

type SortProps = {
  onChange: (value: string) => void;
};

const Sort = ({ onChange }: SortProps) => (
  <Select
    className="content-sort-by"
    placeholder="Sort by:"
    onChange={onChange}
    allowClear
    options={[
      {
        value: 'priceLowHigh',
        label: (
          <span>
            Price: Low to High
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'priceHighLow',
        label: (
          <span>
            Price: High to Low
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameAZ',
        label: (
          <span>
            Name: A → Z
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameZA',
        label: (
          <span>
            Name: Z → A
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      }
    ]}

  />
);

export default Sort;
