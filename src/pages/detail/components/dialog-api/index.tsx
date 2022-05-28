import React, { FC, useState, useEffect } from 'react';
import { IndexModelState, ConnectProps, connect } from 'umi';
import { Select, Row, Col, Radio, Form, Input, Modal, Space, Button, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { cloneDeep, find, pick } from 'lodash';

import { Tpl } from '@/models/tpl';
import { generateTpl } from '@/core';
import CodeBox from '@/components/code-box';
import { API_TPL_DEMO1 } from '@/constants/tpl/api';
import { ApiInterface, Project } from '@/core/types';
import { GenerateApiTplOptions } from '@/core/template';
import DialogTplEdit from '@/pages/detail/components/dialog-tpl-edit';


const { Option } = Select;
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
const DialogApi: FC<DialogApiProps> = ({project, items, visible, onChangeVisible, apiTplList, dispatch}) => {
  const [formRef] = Form.useForm();
  const watchTpl = Form.useWatch('tpl', formRef);
  const watchOnlyApi = Form.useWatch('onlyApi', formRef);
  const [visibleDialogTplEdit, setVisibleDialogTplEdit] = useState(false);
  const [tplCodeList, setTplCodeList] = useState<Array<string>>([]);
  const [editTpl, setEditTpl] = useState<Tpl>(new Tpl());

  const [options, setOptions] = useState<GenerateApiTplOptions>({
    baseURL: '',
    onlyApi: false,
    cancelSameRequest: true,
    headText: '',
    tpl: '',
  });

  const init = (isFirst?: boolean, isDefaultAction?: boolean) => {
    let d = apiTplList.find((t: Tpl) => t.isDefault);
    d = d ?? apiTplList[0];
    const defaultUid = d.uid;
    for (const key in options) {
      if (project.hasOwnProperty(key)) {
        // @ts-ignore
        options[key] = project[key];
      }
    }
    if (isFirst && defaultUid) {
      formRef.setFieldsValue({ tpl: defaultUid });
      setOptions({...options, tpl: defaultUid});
    }
    formRef.setFieldsValue(options);
    onFinish(options, isDefaultAction);
  };

  useEffect(() => { init(true, true); }, [])

  useEffect(() => {
    if (visible && formRef) {
      init(false, true);
    }
  }, [visible]);

  const handleAdd = () => {
    const entity = new Tpl();
    entity.uid = '';
    entity.value = API_TPL_DEMO1;
    setEditTpl(entity);
    setVisibleDialogTplEdit(true);
  };

  const onFinish = (values: GenerateApiTplOptions, isDefaultAction?: boolean) => {
    values = cloneDeep(values);
    const entity = apiTplList.find((t: Tpl) => t.uid === values.tpl);
    if (!entity) {
      return
    }
    // @ts-ignore
    delete values.tpl;
    setOptions(values);
    dispatch?.({type: 'swagger/update', payload: { project, data: pick(values, UPDATE_FIELDS)}});
    setTplCodeList(generateTpl(entity.value, items, values));
    if (!isDefaultAction) {
      message.success('已生成');
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
      const o = {...options, tpl: p.uid };
      setEditTpl(p);
      setOptions(o);
      formRef.setFieldsValue({ tpl: o.tpl });
      onFinish(o, true);
    }
  };

  const handleEditTpl = () => {
    const p = find(apiTplList, (t) => t.uid === watchTpl);
    if (!p) {
      return message.warn('请选择模板');
    }
    if (p.type === -1) {
      Modal.confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: '所选模板为内置模板，是否复制该模板进行编辑？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          const copyTpl = Object.assign(new Tpl(), p, {
            type: 0,
            uid: null,
          });
          copyTpl.name +=  '- 副本';
          setVisibleDialogTplEdit(true);
          setEditTpl(copyTpl);
        }
      });
    } else {
      setVisibleDialogTplEdit(true);
      setEditTpl({...p});
    }
  };

  return(
    <>
      <DialogTplEdit
        options={options}
        tplEntity={editTpl}
        visible={visibleDialogTplEdit}
        onAdd={(entity: Tpl) => {
          const o = {...options, tpl: entity.uid };
          setOptions(o);
          formRef.setFieldsValue({ tpl: entity.uid });
          onFinish(o, true);
        }}
        onDelete={handleDel}
        onChangeVisible={(v, isDelete) => {
          setVisibleDialogTplEdit(v);
          !isDelete && onFinish(options, true)
        }}
      />
      <Modal
        width="96%"
        title="生成API"
        className="tpl-dialog"
        visible={visible}
        onCancel={() => onChangeVisible?.(false)}
        footer={[
          <Button type="primary" onClick={() => onChangeVisible?.(!visible)}>
            确定
          </Button>
        ]}
      >
        <Row gutter={20}>
          <Col span={6}>
            <Space style={{marginBottom: 16, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
              <Button type="primary" onClick={handleAdd}>新增模板</Button>
              <Button type="primary" disabled={!watchTpl} onClick={handleEditTpl}>编辑模板</Button>
              <Button onClick={() => {dispatch?.({type: 'tpl/setDefault', payload: {value: watchTpl, type: 'api'}}); message.success('操作成功')}} disabled={!watchTpl} >设置为默认模板</Button>
            </Space>
            <Form
              form={formRef}
              {...formItemLayout}
              initialValues={options}
              onFinish={onFinish}
            >
              <Form.Item name="tpl" label="选择模板" rules={[{ required: true, message: '必选项' }]}>
                <Select allowClear>
                  {apiTplList.map((t: Tpl) => (
                    <Option value={t.uid}>{t.name}</Option>
                  ))}
                </Select>
              </Form.Item>
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
          <Col span={18}>
            <Row gutter={20}>
              {tplCodeList.map((t) => (
                <Col span={24 / tplCodeList.length}>
                  <div style={{height: '100%'}}><CodeBox code={t} /></div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Modal>
    </>
  )
};

export default connect((state: IndexModelState) => ({ apiTplList: state.tpl.api }))(DialogApi);
