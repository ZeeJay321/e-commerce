'use client';

import { Input } from 'antd';

type SearchBarProps = {
  onSearch: (value: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => (
  <Input.Search
    className="content-search-bar"
    placeholder="Search by user & order ID"
    variant="filled"
    allowClear
    onSearch={onSearch}
  />
);

export default SearchBar;
