import { Select } from 'antd';

const Sort = () => (
  <Select
    showSearch
    className="content-sort-by"
    optionFilterProp="label"
    options={[
      {
        value: 'jack',
        label: 'Jack'
      },
      {
        value: 'lucy',
        label: 'Lucy'
      },
      {
        value: 'tom',
        label: 'Tom'
      }
    ]}
    placeholder="Sort by"
  />
);

export default Sort;
