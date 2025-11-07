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
        value: 'dateNewest',
        label: (
          <span>
            Newest
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'dateOldest',
        label: (
          <span>
            Oldest
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameAZ',
        label: (
          <span>
            A → Z
            {' '}
            <ArrowUpOutlined style={{ fontSize: 12 }} />
          </span>
        )
      },
      {
        value: 'nameZA',
        label: (
          <span>
            Z → A
            {' '}
            <ArrowDownOutlined style={{ fontSize: 12 }} />
          </span>
        )
      }
    ]}

  />
);

export default Sort;
