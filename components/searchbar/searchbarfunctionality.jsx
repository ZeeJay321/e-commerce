'use client';

import { Input } from 'antd';

const SearchBar = () => (
  <Input.Search
    className="content-search-bar"
    placeholder="Search by user & order ID"
    variant="filled"
  />
);

export default SearchBar;
