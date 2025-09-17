'use client';

import { Input } from 'antd';

import 'antd/dist/reset.css';
import './search-bar.css';

let searchTimeout: NodeJS.Timeout;

type SearchBarProps = {
  onSearch: (value: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => (
  <Input.Search
    className="content-search-bar"
    placeholder="Search by user & order ID"
    variant="filled"
    allowClear
    onChange={(e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        onSearch(e.target.value);
      }, 600);
    }}
    onSearch={onSearch}
  />
);

export default SearchBar;
