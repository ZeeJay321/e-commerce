'use client';

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Select } from 'antd';

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
            Price
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'priceHighLow',
        label: (
          <span>
            Price
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameAZ',
        label: (
          <span>
            Name
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameZA',
        label: (
          <span>
            Name
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      }
    ]}
  />
);

export default Sort;
