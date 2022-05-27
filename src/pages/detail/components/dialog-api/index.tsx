import React, { FC, useState, useEffect } from 'react';
import { IndexModelState, ConnectProps, Loading, connect, Link, useParams } from 'umi';
import { Row, Col, Radio, Tree, Spin, Empty, Form, Input, Modal, Space, Table, Button, message, Popconfirm } from 'antd';
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons';
import SwaggerParser from '@apidevtools/swagger-parser';
import { getSwagger, importSwagger } from '@/api';
import { cloneDeep, merge, pick } from 'lodash';
import { ApiInterface, Project, ProjectModuleInterface } from '@/core/types';
import { convertSwaggerData, swaggerParser } from '@/core';
import styles from './index.scss';
import ex from 'umi/dist';
import CodeBox from '@/components/code-box';
import { generateApiMethodImportTpl, generateApiTpl, GenerateApiTplOptions } from '@/core/template';

const UPDATE_FIELDS = ['baseURL', 'headText'];
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

interface DialogApiProps extends ConnectProps {
  project: Project
  items: Array<ApiInterface>
  visible: boolean
  onChangeVisible(v: boolean): void
}
const DialogApi: FC<DialogApiProps> = ({project, items, visible, onChangeVisible, dispatch}) => {
  const [formRef] = Form.useForm();
  const watchOnlyApi = Form.useWatch('onlyApi', formRef);
  const [options, setOptions] = useState<GenerateApiTplOptions>({
    baseURL: '',
    onlyApi: false,
    cancelSameRequest: true,
    headText: '',
  });

  useEffect(() => {
    if (visible && formRef) {
      for (const key in options) {
        if (project.hasOwnProperty(key)) {
          // @ts-ignore
          options[key] = project[key];
        }
      }
      formRef.setFieldsValue(options);
    }
  }, [visible]);

  const onFinish = (values: GenerateApiTplOptions) => {
    setOptions(values);
    dispatch?.({type: 'swagger/update', payload: { project, data: pick(values, UPDATE_FIELDS)}});
  }

  return(
    <Modal
      title="生成API"
      width="70%"
      visible={visible}
      onCancel={() => onChangeVisible?.(false)}
      footer={[
        <Button type="primary" onClick={() => onChangeVisible?.(!visible)}>
          确定
        </Button>
      ]}
    >
      <Row gutter={20}>
        <Col span={8}>
          <Form
            form={formRef}
            {...formItemLayout}
            initialValues={options}
            onFinish={onFinish}
          >
            <Form.Item name="onlyApi" label="只生成API">
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
            {
              !watchOnlyApi && (<>
                <Form.Item name="headText" label="头部内容">
                  <Input.TextArea maxLength={256}/>
                </Form.Item>
                <Form.Item name="baseURL" label="baseURL">
                  <Input maxLength={256}/>
                </Form.Item>
              </>
              )
            }
            <div className="text-align-right">
              <Button type="primary" htmlType="submit">
                立即生成
              </Button>
            </div>
          </Form>
        </Col>
        <Col span={8}>
          <CodeBox code={generateApiTpl(items, options)} />
        </Col>
        <Col span={8}>
          <CodeBox code={generateApiMethodImportTpl(items, project)} />
        </Col>
      </Row>
    </Modal>
  )
};

export default connect((state: IndexModelState) => ({ swagger: state.swagger }))(DialogApi);
