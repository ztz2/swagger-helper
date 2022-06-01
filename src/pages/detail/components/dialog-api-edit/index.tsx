import React, { FC, useState, useEffect } from 'react';
import { IndexModelState, ConnectProps, connect } from 'umi';
import {
  Form,
  Row,
  Col,
  Input,
  Modal,
  Space,
  Popconfirm,
  Button,
  message,
} from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { v4 as uuidv4 } from 'uuid';

import { Tpl, generateTpl } from '@/core';
import CodeBox from '@/components/code-box';
import { getInitApiTplMockData } from '@/constants/tpl/api';

interface DialogApiEditProps extends ConnectProps {
  tplEntity: Tpl;
  visible: boolean;
  options: {
    [propName: string]: any;
  };
  onAdd?(entity: Tpl): void;
  onDelete?(entity: Tpl): void;
  onChangeVisible(v: boolean, isDelete?: boolean): void;
}
const DialogApiEdit: FC<DialogApiEditProps> = ({
  visible,
  options,
  tplEntity,
  onAdd,
  onDelete,
  onChangeVisible,
  dispatch,
}) => {
  const [formRef] = Form.useForm();
  const [tplCodeList, setTplCodeList] = useState<Array<string>>([]);
  const [entity, setEntity] = useState<Tpl>(new Tpl());
  const [codeMirrorValue, setCodeMirrorValue] = useState('');

  useEffect(() => {
    if (visible) {
      formRef.setFieldsValue({ ...tplEntity, ...options });
      setEntity(tplEntity);
      setCodeMirrorValue(tplEntity.value);
      if (tplEntity.value.trim()) {
        handleDebug(tplEntity, true);
      }
    }
  }, [visible]);

  useEffect(() => {
    formRef.setFieldsValue({ ...tplEntity, ...options });
  }, [options]);

  const handleDebug = function (data: Tpl, isFirst: boolean) {
    const v = data?.value ? data : entity;
    if (!isFirst) {
      v.value = codeMirrorValue;
    }
    setTplCodeList(generateTpl(v.value, getInitApiTplMockData(), options));
  };

  const handleDel = () => {
    dispatch?.({ type: 'tpl/delete', payload: { value: entity, type: 'api' } });
    onDelete?.(entity);
    onChangeVisible(false, true);
    message.success('删除成功');
  };

  const onFinish = (values: Tpl) => {
    const data = Object.assign(entity, values);
    data.value = codeMirrorValue;
    if (!data.value) {
      return message.error('请输入模板内容');
    }
    // 编辑
    if (data.uid) {
      dispatch?.({ type: 'tpl/update', payload: { value: data, type: 'api' } });
      // 添加
    } else {
      data.uid = uuidv4();
      dispatch?.({ type: 'tpl/add', payload: { value: data, type: 'api' } });
      onAdd?.(data);
    }
    message.success('操作成功');
    onChangeVisible(false);
  };

  return (
    <>
      <Modal
        width="100%"
        className="dialog-api-edit"
        visible={visible}
        title={entity.uid ? '编辑API模板' : '新增API模板'}
        onCancel={() => onChangeVisible?.(false)}
        footer={[
          <Button onClick={() => onChangeVisible?.(!visible)}>关闭</Button>,
        ]}
      >
        <Row gutter={20}>
          <Col span={10}>
            <Form
              name="basic"
              form={formRef}
              labelCol={{ style: { width: '80px' } }}
              initialValues={{ name: '' }}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Space>
                <Form.Item
                  name="name"
                  label="模板名称"
                  style={{ marginRight: 20 }}
                  rules={[{ required: true, message: '必填项' }]}
                >
                  <Input
                    value={entity.name}
                    onChange={(e) =>
                      setEntity({ ...entity, name: e.target.value })
                    }
                    placeholder="模板名称"
                  />
                </Form.Item>
                {entity.uid && entity.type > -1 && (
                  <Popconfirm
                    title="确定要删除该模板?"
                    onConfirm={handleDel}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button danger>删除</Button>
                  </Popconfirm>
                )}
                <Button
                  onClick={handleDebug}
                  disabled={codeMirrorValue.trim().length === 0}
                >
                  测试
                </Button>
                <Button
                  disabled={
                    codeMirrorValue.trim().length === 0 ||
                    entity.name.trim().length == 0
                  }
                  type="primary"
                  htmlType="submit"
                >
                  保存
                </Button>
              </Space>
              <Form.Item name="value">
                <CodeMirror
                  width="100%"
                  value={codeMirrorValue}
                  extensions={[javascript(), html(), json()]}
                  onChange={(value, viewUpdate) => {
                    setCodeMirrorValue(value);
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col span={14}>
            <Row gutter={20}>
              {tplCodeList.map((c) => (
                <Col span={24 / tplCodeList.length}>
                  <CodeBox code={c} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default connect((state: IndexModelState) => ({}))(DialogApiEdit);
