import {
    Button,
    Input,
    InputNumber,
    Switch,
    Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const getInputField = (input) => {    
    switch (input.type) {
      case 'text':
        return <Input placeholder={input.description} />;
      case 'number':
        return <InputNumber placeholder={input.description} style={{width: '100%'}} />;
      case 'bool':
        return <Switch />;
      case 'image':
      case 'audio':
        return (
          <Upload
            accept={input.type + '/*'}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload {input.type}</Button>
          </Upload>
        );
      default:
        return null;
    }
};

export default getInputField;