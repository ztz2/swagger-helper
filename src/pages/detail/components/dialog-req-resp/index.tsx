import React, { FC, useState, useEffect } from 'react';
import { IndexModelState, ConnectProps, connect } from 'umi';
import {
  Select,
  Row,
  Col,
  Form,
  Tree,
  Modal,
  Space,
  Button,
  message,
  Checkbox,
  InputNumber,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { cloneDeep, find } from 'lodash';

import { Tpl, getCopyName, generateTpl, processFieldTree } from '@/core';
import {
  ApiInterface,
  FieldInterface,
  Project,
  ProjectOptions,
} from '@/core/types';
import { checkType } from '@/utils';
import CodeBox from '@/components/code-box';
import { REQ_RESP_TPL_DEMO1 } from '@/constants/tpl/req-resp';
import { FIELD_NAMES, FILTER_REQUEST_FIELD } from '@/constants';
import { treeFindParentNodes, treeForEach, treeToList } from '@/utils/tree';
import DialogReqRespEdit from '@/pages/detail/components/dialog-req-resp-edit';

const { Option } = Select;
const UPDATE_FIELDS = [
  'semi',
  'crud',
  'grid',
  'maxlength',
  'placeholder',
  'generateLabel',
];
const formItemLayout = {
  labelCol: { style: { width: '156px' } },
  wrapperCol: { style: { flexGrow: 1 } },
};

class ReqRespOptions extends ProjectOptions {
  // 所选模板的UID
  tplUid = '';
  // 所选API的UID
  apiUid = '';
}
interface DialogReqRespProps extends ConnectProps {
  project: Project;
  items: Array<ApiInterface>;
  visible: boolean;
  onChangeVisible(v: boolean): void;
}
const DialogReqResp: FC<DialogReqRespProps> = ({
  project,
  items,
  visible,
  onChangeVisible,
  tplList,
  dispatch,
}) => {
  const [formRef] = Form.useForm();
  const watchTplUid = Form.useWatch('tplUid', formRef);
  const watchApiUid = Form.useWatch('apiUid', formRef);

  const [visibleDialogTplEdit, setVisibleDialogTplEdit] = useState(false);
  const [tplCodeList, setTplCodeList] = useState<Array<string>>([]);
  const [editTpl, setEditTpl] = useState<Tpl>(new Tpl());

  const [isRender, setIsRender] = useState(false);
  const [selectApi, setSelectApi] = useState<ApiInterface>();
  const [reqTree, setReqTree] = useState<Array<FieldInterface>>([]);
  const [respTree, setRespTree] = useState<Array<FieldInterface>>([]);
  const [reqCheckedKeys, setReqCheckedKeys] = useState<Array<string>>([]);
  const [respCheckedKeys, setRespCheckedKeys] = useState<Array<string>>([]);
  const [respExpandedKeys, setRespExpandedKeys] = useState<Array<string>>([]);
  const [reqCheckedNodes, setReqCheckedNodes] = useState<Array<FieldInterface>>(
    [],
  );
  const [respCheckedNodes, setRespCheckedNodes] = useState<
    Array<FieldInterface>
  >([]);

  const [options, setOptions] = useState<ReqRespOptions>(new ReqRespOptions());

  // Mounted - 设置默认选中的API
  useEffect(() => {
    resetOptions();
  }, []);

  // 项目变化之后，恢复表单数据
  useEffect(() => {
    resetOptions();
  }, [project, items]);

  // 弹窗状态变化
  useEffect(() => {
    if (visible) {
      resetOptions((o: ReqRespOptions) => {
        onFinish(o, true);
      });
    }
  }, [visible]);

  useEffect(() => {
    handleSelectApi(watchApiUid);
  }, [watchApiUid]);

  useEffect(() => {
    const requests = selectApi?.requests ?? [];
    const responses = selectApi?.responses ?? [];
    // 请求数据字段选中
    const reqCheckedNodeList = cloneDeep(requests)
      .map((t) => {
        return t.key.includes('.') || FILTER_REQUEST_FIELD.includes(t.key)
          ? null
          : t;
      })
      .filter((t) => t);
    setReqCheckedNodes(reqCheckedNodeList);
    setReqCheckedKeys(reqCheckedNodeList.map((t) => t.uid));

    // 响应数据字段选中
    const initNodeList = (key = 'content') => {
      const result = [];
      let lock = false;
      treeForEach(responses, (item) => {
        if (item.key === key && !lock) {
          lock = true;
          item.children.forEach((t) => {
            if (!t.key.includes('.') && !FILTER_REQUEST_FIELD.includes(t.key)) {
              result.push(t);
            }
          });
        }
      });
      return result;
    };
    let respCheckedNodeList = initNodeList('content');
    respCheckedNodeList =
      respCheckedNodeList.length > 0
        ? respCheckedNodeList
        : initNodeList('data');
    const t = respCheckedNodeList.map((t) => t.uid);
    setRespCheckedKeys(t);
    setRespCheckedNodes(respCheckedNodeList);

    // 响应数据，子集选中，父级展开
    const expand = [];
    respCheckedNodeList.forEach((node) => {
      treeFindParentNodes(treeToList(cloneDeep(responses)), node, {
        id: 'uid',
        pid: 'parentUid',
      }).forEach((pNode) => {
        expand.push(pNode.uid);
      });
    });
    setRespExpandedKeys(expand);

    setReqTree(requests);
    setRespTree(responses);
  }, [selectApi]);

  useEffect(() => {
    if (isRender) {
      onFinish(null, true);
      setIsRender(false);
    }
  }, [reqTree, respTree]);

  const resetOptions = (callback?: (o: ReqRespOptions) => void) => {
    const defaultTpl = tplList.find((t: Tpl) => t.isDefault);
    const defaultUid = defaultTpl ? defaultTpl.uid : tplList?.[0]?.uid ?? '';
    const o: ReqRespOptions = {
      ...options,
      ...(project?.options ?? {}),
      tplUid: defaultUid,
    };
    if (!selectApi && items?.length > 0) {
      const api = items[0];
      o.apiUid = api.uid;
      setSelectApi(api);
      setIsRender(true);
    }
    setOptions(o);
    formRef?.setFieldsValue?.(o);
    callback?.(o);
  };

  const handleAdd = () => {
    const entity = new Tpl();
    entity.uid = '';
    entity.value = REQ_RESP_TPL_DEMO1;
    setEditTpl(entity);
    setVisibleDialogTplEdit(true);
  };

  const onFinish = (
    values?: ReqRespOptions | null,
    isDefaultAction?: boolean,
  ) => {
    const o = checkType(values, 'Object') ? values : options;
    const tplEntity = tplList.find((t: Tpl) => t.uid === o?.tplUid);
    if (tplEntity) {
      setTplCodeList(
        generateTpl(
          tplEntity.value,
          selectApi,
          processFieldTree(reqTree, reqCheckedNodes),
          processFieldTree(respTree, respCheckedNodes),
          o,
          () => {
            if (!isDefaultAction) {
              message.success('已生成');
            }
          },
        ),
      );
    }
  };

  const handleDel = (entity: Tpl) => {
    // 删除的是已选择
    if (entity.uid === editTpl.uid) {
      let p = tplList[0];
      if (!p) {
        p = new Tpl();
        p.uid = '';
      }
      const o = { ...options, tpl: p.uid };
      setEditTpl(p);
      setOptions(o);
      formRef.setFieldsValue({ tpl: o.tpl });
      onFinish(o, true);
    }
  };

  const handleEditTpl = () => {
    const p = find(tplList, (t) => t.uid === watchTplUid);
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
          copyTpl.name = getCopyName(copyTpl.name);
          setVisibleDialogTplEdit(true);
          setEditTpl(copyTpl);
        },
      });
    } else {
      setVisibleDialogTplEdit(true);
      setEditTpl({ ...p });
    }
  };

  const handleSelectApi = (apiUid: string) => {
    setSelectApi(find(items, (t) => t.uid === apiUid));
  };

  const handleTreeCheck = (
    selectedKeys: Array<string>,
    { checkedNodes }: any,
    type: string,
  ) => {
    if (type === 'req') {
      setReqCheckedNodes(checkedNodes);
    } else if (type === 'resp') {
      setRespCheckedNodes(checkedNodes);
    }
  };

  return (
    <>
      <DialogReqRespEdit
        options={options}
        tplEntity={editTpl}
        visible={visibleDialogTplEdit}
        onSave={(entity: Tpl) => {
          setTimeout(() => {
            onFinish(o, true);
          }, 250);
          const o = { ...options, tplUid: entity.uid };
          setOptions(o);
          formRef.setFieldsValue({ tplUid: entity.uid });
          dispatch?.({
            type: 'tpl/setDefault',
            payload: { value: entity.uid, type: 'reqResp' },
          });
        }}
        onDelete={handleDel}
        onChangeVisible={(v, isDelete) => {
          setVisibleDialogTplEdit(v);
          !isDelete && onFinish(options, true);
        }}
      />
      <Modal
        width="96%"
        title="生成(请求参数 | 响应数据)"
        className="tpl-dialog dialog-req-resp"
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
            >
              <div>
                <div style={{ marginBottom: 18 }}>
                  <Form.Item
                    name="apiUid"
                    label="选择API"
                    rules={[{ required: true, message: '必选项' }]}
                  >
                    <Select allowClear>
                      {items.map((t: ApiInterface) => (
                        <Option value={t.uid} key={t.uid}>
                          <Space>
                            <span>【{t.method.toUpperCase()}】</span>
                            <span>{t.url}</span>
                            <span>{t.label}</span>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ marginBottom: 18 }}>
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
                          payload: { value: uid, type: 'reqResp' },
                        });
                      }}
                    >
                      {tplList.map((t: Tpl) => (
                        <Option value={t.uid} key={t.uid}>
                          {t.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <Col span={24}>
                  <Space
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      marginLeft: '-10px',
                    }}
                  >
                    <Form.Item
                      name="maxlength"
                      label="输入框 maxlength 属性"
                      style={{ margin: '0 12px 0 0' }}
                    >
                      <InputNumber
                        placeholder="输入框 maxlength 属性"
                        style={{ width: 156 }}
                        onChange={(value) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: { project, data: { maxlength: value } },
                          });
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="semi" valuePropName="checked">
                      <Checkbox
                        onChange={(e) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: {
                              project,
                              data: { semi: e.target.checked },
                            },
                          });
                        }}
                      >
                        <span className="white-space-nowrap">分号符</span>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="crud" valuePropName="checked">
                      <Checkbox
                        onChange={(e) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: {
                              project,
                              data: { crud: e.target.checked },
                            },
                          });
                        }}
                      >
                        <span className="white-space-nowrap">生成CURD</span>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="grid" valuePropName="checked">
                      <Checkbox
                        onChange={(e) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: {
                              project,
                              data: { grid: e.target.checked },
                            },
                          });
                        }}
                      >
                        <span className="white-space-nowrap">格栅布局</span>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="placeholder" valuePropName="checked">
                      <Checkbox
                        onChange={(e) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: {
                              project,
                              data: { placeholder: e.target.checked },
                            },
                          });
                        }}
                      >
                        <span className="white-space-nowrap">
                          输入框生成placeholder
                        </span>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="generateLabel" valuePropName="checked">
                      <Checkbox
                        onChange={(e) => {
                          dispatch?.({
                            type: 'swagger/updateOptions',
                            payload: {
                              project,
                              data: { generateLabel: e.target.checked },
                            },
                          });
                        }}
                      >
                        <span className="white-space-nowrap">
                          表单生成label
                        </span>
                      </Checkbox>
                    </Form.Item>
                  </Space>
                </Col>
              </div>
              <Row>
                <Col span={12}>
                  <div>请求数据字段</div>
                  <div>
                    <Tree
                      treeData={reqTree}
                      fieldNames={FIELD_NAMES}
                      checkedKeys={reqCheckedKeys}
                      onCheck={(selectedKeys, e) => {
                        setReqCheckedKeys(selectedKeys);
                        handleTreeCheck(selectedKeys, e, 'req');
                      }}
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
                      checkedKeys={respCheckedKeys}
                      expandedKeys={respExpandedKeys}
                      onCheck={(selectedKeys, e) => {
                        setRespCheckedKeys(selectedKeys);
                        handleTreeCheck(selectedKeys, e, 'resp');
                      }}
                      onExpand={(expandedKeys) => {
                        setRespExpandedKeys(expandedKeys);
                      }}
                      checkable
                      checkStrictly
                    />
                  </div>
                </Col>
              </Row>
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
  tplList: state.tpl.reqResp,
}))(DialogReqResp);
