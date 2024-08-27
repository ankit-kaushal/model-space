import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Form,
  message,
  Spin,
} from 'antd';
import { useParams } from 'react-router-dom';

import convertToBase64 from '../../helpers/convertToBase64';
import getInputField from '../../helpers/getInputField';

import styles from './styles.module.css';

const renderOutputValue = (key, value, outputs) => {
    const output = outputs.find((out) => out.name === key);
  
    if (!output) return <span>Unsupported output type.</span>;
  
    const isBase64 = (str) => /^data:/.test(str);
  
    switch (output.type) {
      case 'text':
      case 'number':
      case 'bool':
        return <span>{value.toString()}</span>;
  
      case 'image':
        const imageSrc = !isBase64(value) ? value : `data:image/png;base64,${value}`;
        return (
          <img
            src={imageSrc}
            alt={key}
            className={styles.output_image}
          />
        );
  
      case 'audio':
        const audioSrc = !isBase64(value) ? value : `data:audio/wav;base64,${value}`;
        return (
          <audio controls>
            <source src={audioSrc} />
            Your browser does not support the audio element.
          </audio>
        );
  
      case 'images':
        return (
          <div className={styles.output_images}>
            {value.map((img, index) => {
              const imgSrc = !isBase64(img) ? img : `data:image/png;base64,${img}`;
              return (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`${key}-${index}`}
                  className={styles.output_image}
                />
              );
            })}
          </div>
        );
  
      default:
        return <span>Unsupported output type.</span>;
    }
  };

const ModelSpace = () => {
  const { id } = useParams();
  const [form] = Form.useForm();

  const [modelSpace, setModelSpace] = useState(null);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [outputVisible, setOutputVisible] = useState(false);

  useEffect(() => {
    const fetchModelSpace = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/model-spaces/${id}`
        );
        setModelSpace(response.data.data);
      } catch (error) {
        message.error('Error fetching model space details.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchModelSpace();
  }, [id]);

  const onFinish = async (values) => {
    setLoading(true);
    setOutput(null);
    const formData = { ...values };
    for (const key in formData) {
      if (formData[key] && formData[key]?.file) {
        const file = formData[key].file.originFileObj || formData[key].file;
        if (file instanceof Blob) {
          try {
            formData[key] = await convertToBase64(file);
          } catch (error) {
            message.error('Error converting file to base64.');
          }
        } else {
          message.error('Uploaded file is not of type Blob.');
        }
      }
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/model-spaces/${id}/predict`, formData);
      setOutput(response.data.data);
      setOutputVisible(true);
    } catch (error) {
      message.error('Error predicting output.');
    } finally {
      setLoading(false);
    }
};

  const handleRegenerate = () => {
    form.resetFields();
    setOutputVisible(false);
  };

  return (
    <div className={styles.container}>
      {fetchLoading ? (
        <div className={styles.loader}>
          <Spin size="large" />
        </div>
      ) : modelSpace ? (
        <>
          <h1 className={styles.heading}>{modelSpace.name}</h1>
          <p className={styles.description}>{modelSpace.description}</p>
          <div className={styles.content}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className={`${styles.form} ${!outputVisible ? styles.form_centered : styles.form_shifted}`}
            >
              {modelSpace.inputs.map((input) => (
                <Form.Item
                  key={input.name}
                  name={input.name}
                  label={input.name}
                  rules={[
                    {
                      required: input.required,
                      message: `Please provide a ${input.name}`,
                    },
                  ]}
                >
                  {getInputField(input)}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={styles.predict_button}
                  block
                >
                  Predict
                </Button>
              </Form.Item>
              {outputVisible && (
                <Button
                  type="default"
                  onClick={handleRegenerate}
                  className={styles.regenerate_button}
                >
                  Re-generate
                </Button>
              )}
            </Form>
            <div
              className={`${styles.output_container} ${outputVisible ? styles.output_visible : ''}`}
            >
              {output ? (
                <div className={styles.output_content}>
                  <h2>Output</h2>
                  {Object.entries(output).map(([key, value]) => (
                    <div key={key} className={styles.output_item}>
                      <strong>{key}:</strong>
                      {renderOutputValue(key, value, modelSpace.outputs)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.output_placeholder}>
                  <p>The output will appear here after prediction.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.error_message}>
          <p>Unable to load model space details.</p>
        </div>
      )}
    </div>
  );
};

export default ModelSpace;