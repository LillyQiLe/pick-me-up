import { useDispatch, useSelector } from "react-redux";
import { State } from "../../state";
import { ColumnsType } from "antd/es/table";
import { useForm } from "antd/es/form/Form";
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, InputRef, InputNumber } from 'antd';
import { FormInstance } from 'antd/lib/form';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string | number;
  yinsu: string;
  [index: number]: number | string;
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
  // const inputNode = <InputNumber />;

  return (
    <td {...restProps}>
      {editable ? (
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
        children
      )}
    </td>
  )
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: string | number;
  yinsu: string;
  [index: number]: number | string;
}

interface EditableTableState {
  dataSource: DataType[];
  count: number;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const initialColumn = [
  {
    key: "yinsu",
    title: "因素",
    dataIndex: "yinsu",
    editable: false
  }
];

type Column = (ColumnTypes[number] & { editable?: boolean; dataIndex: string | number });

const EditableTable = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumn);
  const finallyTags = useSelector((state: State) => state.finallyTags);
  const [dataSource, setDataSource] = useState<Item[]>([]);
  const [count, setCount] = useState(0);
  // columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

  useEffect(() => {
    let newColumns: Column[] = [];
    let newDate: Item[] = [];

    finallyTags.forEach((value, index) => {
      let column: Column = {
        title: value,
        dataIndex: index,
        editable: true
      }
      let singleRow: Item = {
        key: value,
        yinsu: value
      }
      
      newColumns.push(column);
      newDate.push(singleRow);
    })
    
    setColumns([...initialColumn, ...newColumns]);
    setDataSource([...newDate]);
    console.log('columns', [...initialColumn, ...newColumns])
  }, [finallyTags]);

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
      })
    };
  });

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData)
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  
  return (
    <div>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={mergedColumns as ColumnTypes}
        pagination={false}
      />
    </div>
  );
}

export default EditableTable