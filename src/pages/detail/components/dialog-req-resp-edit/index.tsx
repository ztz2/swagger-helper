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
  Select,
  InputNumber,
  Checkbox,
  Tree,
} from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { v4 as uuidv4 } from 'uuid';

import { Tpl } from '@/models/tpl';
import { generateTpl } from '@/core';
import CodeBox from '@/components/code-box';
import { getInitApiTplMockData } from '@/constants/tpl/api';
import { ApiInterface, FieldInterface } from '@/core/types';
import { FIELD_NAMES } from '@/constants';
import { getMockApiData } from '@/constants/tpl/req-resp';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface DialogReqRespEditProps extends ConnectProps {
  tplEntity: Tpl
  visible: boolean
  options: {
    [propName: string]: any
  }
  onAdd?(entity: Tpl): void
  onDelete?(entity: Tpl): void
  onChangeVisible(v: boolean, isDelete?: boolean): void
}
const DialogReqRespEdit: FC<DialogReqRespEditProps> = ({visible, options, tplEntity, onAdd, onDelete, onChangeVisible, dispatch}) => {
  const [formRef] = Form.useForm();
  const [tplCodeList, setTplCodeList] = useState<Array<string>>([]);
  const [entity, setEntity] = useState<Tpl>(new Tpl());
  const [codeMirrorValue, setCodeMirrorValue] = useState('');

  const [selectApi, setSelectApi] = useState<ApiInterface>(getMockApiData());
  const [reqTree, setReqTree] = useState<Array<FieldInterface>>([]);
  const [respTree, setRespTree] = useState<Array<FieldInterface>>([]);
  const [reqCheckedNodes, setReqCheckedNodes] = useState<Array<FieldInterface>>([]);
  const [respCheckedNodes, setRespCheckedNodes] = useState<Array<FieldInterface>>([]);

  useEffect(() => {
    if (visible) {
      formRef.setFieldsValue({...tplEntity});
      setEntity(tplEntity);
      setCodeMirrorValue(tplEntity.value);
      if (tplEntity.value.trim()) {
        handleDebug(tplEntity, true);
      }
    }
  }, [visible]);

  useEffect(() => {
    console.log('selectApi: ', JSON.stringify(selectApi));
    setReqTree(selectApi?.requests ?? []);
    setRespTree(selectApi?.responses ?? []);
  }, [selectApi]);

  const handleDebug = function(data: Tpl, isFirst: boolean) {
    const v = data?.value ? data : entity;
    if (!isFirst) { v.value = codeMirrorValue; }
    setTplCodeList(generateTpl(v.value, reqCheckedNodes, respCheckedNodes, options));
  }

  const handleDel = () => {
    dispatch?.({type: 'tpl/delete', payload: {value: entity, type: 'reqResp'}});
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
      dispatch?.({type: 'tpl/update', payload: {value: data, type: 'reqResp'}});
      // 添加
    } else {
      data.uid = uuidv4();
      dispatch?.({type: 'tpl/add', payload: {value: data, type: 'reqResp'}});
      onAdd?.(data);
    }
    message.success('操作成功');
    onChangeVisible(false);
  };

  const handleTreeCheck = (selectedKeys: Array<string>, { checkedNodes }: any, type: string) => {
    if (type === 'req') {
      setReqCheckedNodes(checkedNodes);
    } else if (type === 'resp') {
      setRespCheckedNodes(checkedNodes);
    }
  };

  return(
    <>
      <Modal
        width="100%"
        className="tpl-edit-dialog tpl-dialog__req-resp"
        visible={visible}
        title={entity.uid ? '编辑API模板' : '新增API模板'}
        onCancel={() => onChangeVisible?.(false)}
        footer={[
          <Button onClick={() => onChangeVisible?.(!visible)}>关闭</Button>
        ]}
      >
        <Form
          name="basic"
          form={formRef}
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ name: '' }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <div />
          <div>
            <Row gutter={20}>
              <Col span={14}>
                <Row>
                  <Col span={8}>
                    <Form
                      form={formRef}
                      {...formItemLayout}
                      initialValues={options}
                      onFinish={onFinish}
                    >
                      <Row gutter={10}>
                        <Col span={24}>
                          <Space style={{margin: '0 20px 30px 0', justifyContent: 'flex-end', display: 'flex', flexWrap: 'wrap'}}>
                            { entity.uid && entity.type > 0 &&
                            <Popconfirm
                              title="确定要删除该模板?"
                              onConfirm={handleDel}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button danger>删除</Button>
                            </Popconfirm>
                            }
                            <Button onClick={handleDebug} disabled={codeMirrorValue.trim().length === 0}>测试</Button>
                            <Button disabled={codeMirrorValue.trim().length === 0 || entity.name.trim().length == 0} type="primary" htmlType="submit">保存</Button>
                          </Space>
                        </Col>
                        <Col span={24}>
                          <Space style={{display: 'flex', flexWrap: 'wrap'}}>
                            <Form.Item
                              name="name"
                              label="必填"
                              rules={[{ required: true, message: '必填项' }]}
                            >
                              <Input value={entity.name} onChange={(e) => setEntity({...entity, name: e.target.value})} placeholder="模板名称" />
                            </Form.Item>
                            <Form.Item name="maxlength" style={{}}>
                              <InputNumber placeholder="输入框maxlength" style={{ width: 156 }} />
                            </Form.Item>
                            <Form.Item
                              name="crud"
                              valuePropName="checked"
                            >
                              <Checkbox><span className="white-space-nowrap">生成CURD</span></Checkbox>
                            </Form.Item>
                            <Form.Item
                              name="grid"
                              valuePropName="checked"
                            >
                              <Checkbox><span className="white-space-nowrap">格栅布局</span></Checkbox>
                            </Form.Item>
                            <Form.Item
                              name="placeholder"
                              valuePropName="checked"
                            >
                              <Checkbox><span className="white-space-nowrap">输入框生成placeholder</span></Checkbox>
                            </Form.Item>
                            <Form.Item
                              name="generateLabel"
                              valuePropName="checked"
                            >
                              <Checkbox><span className="white-space-nowrap">表单生成label</span></Checkbox>
                            </Form.Item>
                          </Space>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={12}>
                          <div>请求数据字段</div>
                          <div>
                            <Tree
                              treeData={reqTree}
                              fieldNames={FIELD_NAMES}
                              onCheck={(selectedKeys, e) => handleTreeCheck(selectedKeys, e, 'req')}
                              checkable
                              checkStrictly
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div>响应数据字段</div>
                          <div>
                            <Tree
                              treeData={respTree}
                              fieldNames={FIELD_NAMES}
                              onCheck={(selectedKeys, e) => handleTreeCheck(selectedKeys, e, 'resp')}
                              checkable
                              checkStrictly
                            />
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                  <Col span={16}>
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
                  </Col>
                </Row>
              </Col>
              <Col span={10}>
                <Row gutter={20}>
                  {tplCodeList.map((c) => (
                    <Col span={24 / tplCodeList.length}><CodeBox code={c} /></Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>
    </>
  )
};

export default connect((state: IndexModelState) => ({}))(DialogReqRespEdit);
