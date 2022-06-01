import React, { FC, useState, useEffect } from 'react';
import { find } from 'lodash';
import { IndexModelState, ConnectProps, connect } from 'umi';
import {
  Select,
  Row,
  Col,
  Form,
  Input,
  Modal,
  Space,
  Button,
  message,
  Checkbox,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { Tpl, generateTpl } from '@/core';
import CodeBox from '@/components/code-box';
import { API_TPL_DEMO1 } from '@/constants/tpl/api';
import { ApiInterface, Project, ProjectOptions } from '@/core/types';
import DialogApiEdit from '@/pages/detail/components/dialog-api-edit';
import { checkType } from '@/utils';

const { Option } = Select;
const formItemLayout = {
  labelCol: { style: { width: '84px' } },
};

class DialogApiOptions extends ProjectOptions {
  tplUid = '';
}
interface DialogApiProps extends ConnectProps {
  project: Project;
  items: Array<ApiInterface>;
  visible: boolean;
  onChangeVisible(v: boolean): void;
}
const DialogApi: FC<DialogApiProps> = ({
  project,
  items,
  visible,
  onChangeVisible,
  apiTplList,
  dispatch,
}) => {
  const [formRef] = Form.useForm();
  const watchTplUid = Form.useWatch('tplUid', formRef);
  const watchOnlyApi = Form.useWatch('onlyApi', formRef);
  const [visibleDialogTplEdit, setVisibleDialogTplEdit] = useState(false);
  const [tplCodeList, setTplCodeList] = useState<Array<string>>([]);
  const [editTpl, setEditTpl] = useState<Tpl>(new Tpl());

  const [options, setOptions] = useState<DialogApiOptions>(
    new DialogApiOptions(),
  );

  // Mounted - 设置默认选中的API
  useEffect(() => {
    resetOptions();
  }, []);

  // 项目变化之后，恢复表单数据
  useEffect(() => {
    resetOptions();
  }, [project]);

  // 弹窗状态变化
  useEffect(() => {
    if (visible) {
      onFinish(null, true);
    }
  }, [visible]);

  const resetOptions = () => {
    const defaultAPI = apiTplList.find((t: Tpl) => t.isDefault);
    const defaultUid = defaultAPI ? defaultAPI.uid : apiTplList?.[0]?.uid ?? '';
    const o = { ...options, ...(project?.options ?? {}), tplUid: defaultUid };
    setOptions(o);
    formRef?.setFieldsValue?.(o);
  };

  const handleAdd = () => {
    const entity = new Tpl();
    entity.uid = '';
    entity.value = API_TPL_DEMO1;
    setEditTpl(entity);
    setVisibleDialogTplEdit(true);
  };

  const onFinish = (
    values?: DialogApiOptions | null,
    formVisible?: boolean,
  ) => {
    const o = checkType(values, 'Object') ? values : options;
    const tplEntity = apiTplList.find((t: Tpl) => t.uid === o?.tplUid);
    if (tplEntity) {
      setTplCodeList(
        generateTpl(tplEntity.value, items, o, () => {
          if (!formVisible) {
            message.success('已生成');
          }
        }),
      );
    }
  };

  const handleDel = (entity: Tpl) => {
    // 删除的是已选择
    if (entity.uid === editTpl.uid) {
      let p = apiTplList[0];
      if (!p) {
        p = new Tpl();
        p.uid = '';
      }
      const o = { ...options, tplUid: p.uid };
      setEditTpl(p);
      setOptions(o);
      formRef.setFieldsValue({ tplUid: o.tplUid });
      onFinish(o);
    }
  };

  const handleEditTpl = () => {
    const p = find(apiTplList, (t) => t.uid === watchTplUid);
    if (!p) {
      return message.warn('请选择模板');
    }
    const o = { ...options, ...formRef.getFieldsValue() };
    setOptions(o);
    if (p.type < 0) {
      Modal.confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: '所选模板为内置模板，是否复制该模板进行编辑？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          const copyTpl = Object.assign(new Tpl(), p, {
            type: 1,
            uid: null,
          });
          copyTpl.name += '- 副本';
          setVisibleDialogTplEdit(true);
          setEditTpl(copyTpl);
        },
      });
    } else {
      setVisibleDialogTplEdit(true);
      setEditTpl({ ...p });
    }
  };

  return (
    <>
      <DialogApiEdit
        options={options}
        tplEntity={editTpl}
        visible={visibleDialogTplEdit}
        onAdd={(entity: Tpl) => {
          const o = { ...options, tplUid: entity.uid };
          setOptions(o);
          formRef.setFieldsValue({ tplUid: entity.uid });
          onFinish(o, true);
        }}
        onDelete={handleDel}
        onChangeVisible={(v, isDelete) => {
          setVisibleDialogTplEdit(v);
          !isDelete && onFinish(null, true);
        }}
      />
      <Modal
        width="96%"
        title="生成(API)"
        className="tpl-dialog"
        visible={visible}
        onCancel={() => onChangeVisible?.(false)}
        footer={[
          <Button onClick={() => onChangeVisible?.(!visible)}>关闭</Button>,
        ]}
      >
        <Row gutter={20}>
          <Col span={7}>
            <Space
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <Button onClick={handleAdd}>新增模板</Button>
              <Button disabled={!watchTplUid} onClick={handleEditTpl}>
                编辑模板
              </Button>
              <Button
                type="primary"
                onClick={() => formRef.submit()}
                style={{ marginLeft: 30 }}
              >
                立即生成
              </Button>
            </Space>
            <Form
              form={formRef}
              {...formItemLayout}
              initialValues={options}
              onFinish={onFinish}
              style={{ marginTop: 30 }}
            >
              <Form.Item
                name="tplUid"
                label="选择模板"
                rules={[{ required: true, message: '必选项' }]}
              >
                <Select
                  allowClear
                  onChange={(uid) => {
                    dispatch?.({
                      type: 'tpl/setDefault',
                      payload: { value: uid, type: 'api' },
                    });
                  }}
                >
                  {apiTplList.map((t: Tpl) => (
                    <Option value={t.uid} key={t.uid}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {!watchOnlyApi && (
                <>
                  <Form.Item name="headText" label="头部内容">
                    <Input.TextArea
                      maxLength={2048}
                      onChange={(e) => {
                        dispatch?.({
                          type: 'swagger/updateOptions',
                          payload: {
                            project,
                            data: { headText: e.target.value },
                          },
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="baseURL" label="baseURL">
                    <Input
                      maxLength={2048}
                      onChange={(e) => {
                        dispatch?.({
                          type: 'swagger/updateOptions',
                          payload: {
                            project,
                            data: { baseURL: e.target.value },
                          },
                        });
                      }}
                    />
                  </Form.Item>
                </>
              )}
              <Space
                size={20}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                <Form.Item name="semi" valuePropName="checked">
                  <Checkbox
                    onChange={(e) => {
                      dispatch?.({
                        type: 'swagger/updateOptions',
                        payload: { project, data: { semi: e.target.checked } },
                      });
                    }}
                  >
                    <span className="white-space-nowrap">分号符</span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="onlyApi" valuePropName="checked">
                  <Checkbox
                    onChange={(e) => {
                      dispatch?.({
                        type: 'swagger/updateOptions',
                        payload: {
                          project,
                          data: { onlyApi: e.target.checked },
                        },
                      });
                    }}
                  >
                    <span className="white-space-nowrap">只生成API</span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="cancelSameRequest" valuePropName="checked">
                  <Checkbox
                    onChange={(e) => {
                      dispatch?.({
                        type: 'swagger/updateOptions',
                        payload: {
                          project,
                          data: { cancelSameRequest: e.target.checked },
                        },
                      });
                    }}
                  >
                    <span className="white-space-nowrap">取消重复请求</span>
                  </Checkbox>
                </Form.Item>
              </Space>
            </Form>
          </Col>
          <Col span={17}>
            <Row gutter={20}>
              {tplCodeList.map((t, index) => (
                <Col span={24 / tplCodeList.length} key={index}>
                  <div style={{ height: '100%' }}>
                    <CodeBox code={t} />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default connect((state: IndexModelState) => ({
  apiTplList: state.tpl.api,
}))(DialogApi);
