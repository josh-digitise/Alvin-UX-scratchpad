import React, { useContext, useEffect, useRef, useState } from 'react';
import './index.css';
import {
  Checkbox,
  Divider,
  InputRef,
  Radio,
  Segmented,
  Select,
  Space,
  Typography,
} from 'antd';
import { Button, Form, Input, Popconfirm, Table } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  assignee: boolean;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const App: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      key: '0',
      name: 'Instrument 88B',
      price: 100,
      discount: 0,
      quantity: 1,
      assignee: true,
    },
    {
      key: '1',
      name: 'Critical Stage Inspections',
      price: 100,
      quantity: 3,
      discount: 0,
      assignee: false,
    },
  ]);

  const [count, setCount] = useState(2);

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: 'Product',
      dataIndex: 'name',
      width: '30%',
      editable: false,
      render: (_, value) => {
        return <Select showSearch value={_} />;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Discount %',
      dataIndex: 'discount',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
    },
    {
      title: 'Assigned to client',
      dataIndex: 'assignee',
      render: (_, record: DataType) => <Checkbox value={_}></Checkbox>,
    },
  ];

  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      name: `Section 10.7 (2)`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <Space direction="vertical">
      <Space direction="vertical">
        <Typography.Text>Client Category</Typography.Text>
        <Segmented options={['Ruby', 'Platinum', 'Gold', 'Silver', 'Bronze']} />
      </Space>
      <Space>
        <Space direction="vertical">
          <Typography.Text>FFA</Typography.Text>
          <Select
            showSearch
            placeholder="JoshCorp"
            optionFilterProp="children"
          />
        </Space>
        <Space direction={'vertical'}>
          <Typography.Text>Development Type</Typography.Text>
          <Select
            showSearch
            placeholder="Select Development Type"
            optionFilterProp="children"
          />
        </Space>
        <Space direction="vertical">
          <Typography.Text>Cost of works: </Typography.Text>
          <Space.Compact>
            <Input addonBefore="Min" placeholder="$0" />
            <Input addonBefore="Max" placeholder="$1,000,000" />
          </Space.Compact>
        </Space>
      </Space>

      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        pagination={false}
      />

      <Button
        onClick={handleAdd}
        type="primary"
        icon={<PlusCircleFilled />}
        style={{ marginBottom: 16 }}
      >
        Add Product
      </Button>
    </Space>
  );
};

export default App;
