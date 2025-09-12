'use client';

import { Input } from 'antd';
import 'antd/dist/reset.css';
import './searchbar.css';

type SearchBarProps = {
  onSearch: (value: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => (
  <Input.Search
    className="content-search-bar"
    placeholder="Search by user & order ID"
    variant="filled"
    allowClear
    onChange={(e) => onSearch(e.target.value)}
    onSearch={onSearch}
  />
);

export default SearchBar;
