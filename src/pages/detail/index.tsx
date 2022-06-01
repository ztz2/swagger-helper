import { find } from 'lodash';
import React, { FC, useState, useEffect, useRef } from 'react';
import { connect, useParams, ConnectProps, IndexModelState } from 'umi';
import {
  Tooltip,
  Result,
  Alert,
  Tag,
  Collapse,
  Spin,
  Empty,
  Space,
  Button,
  message,
  Modal,
  Input,
} from 'antd';
import { SmileOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { Tpl, generateTpl, swaggerParser } from '@/core';
import { copyToClipboard } from '@/utils';
import Tree from './components/tree/index';
import CodeBox from '@/components/code-box';
import DialogApi from './components/dialog-api';
import { ApiInterface, Project } from '@/core/types';
import { REQ_RESP_TPL6000 } from '@/constants/tpl/req-resp';
import DialogReqResp from '@/pages/detail/components/dialog-req-resp';
import styles from './index.scss';

const { Panel } = Collapse;
const { TextArea } = Input;

interface DetailPageUrlParams {
  uid: string | undefined;
}
interface DetailPageProps extends ConnectProps {
  swagger: IndexModelState;
}
const DetailPage: FC<DetailPageProps> = ({
  tpl,
  apiTplList,
  swaggerList,
  dispatch,
}) => {
  const urlParams: DetailPageUrlParams = useParams();
  const layoutRightRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState<null | boolean>(null);
  const [project, setProject] = useState<Project>(new Project());
  const [selectApiList, setSelectApiList] = useState<Array<ApiInterface>>([]);
  const [visibleDialogApi, setVisibleDialogApi] = useState<boolean>(false);
  const [visibleDialogReqResp, setVisibleDialogReqResp] =
    useState<boolean>(false);
  const [apiTpl, setApiTpl] = useState<Tpl>(new Tpl());
  const [importText, setImportText] = useState<string>('');
  const [visibleImport, setVisibleImport] = useState<boolean>(false);

  useEffect(() => {
    const { uid } = urlParams;
    const s = swaggerList.find((t: Project) => t.uid === uid);
    if (!s) {
      setIsEmpty(true);
    }
    swaggerParser(s)
      .then((list: Array<Project>) => {
        if (list.length === 0) {
          setIsEmpty(true);
          return message.error(
            '没有获取到配置文件，请检查Swagger文档地址是否正确？',
          );
        }
        setIsEmpty(false);
        setProject(list[0]);
      })
      .catch(() => setIsEmpty(true));
  }, []);

  useEffect(() => {
    if (project) {
      const item = find(swaggerList, (t) => t.uid === project.uid);
      item && setProject({ ...project, options: item.options });
    }
  }, [swaggerList]);

  useEffect(() => {
    const d = apiTplList.find((t: Tpl) => t.isDefault);
    setApiTpl(d ?? apiTplList[0]);
  }, [apiTplList]);

  useEffect(() => {
    // @ts-ignore
    if (layoutRightRef && layoutRightRef.current) {
      layoutRightRef.current.scrollTop = 0;
    }
  }, [selectApiList]);

  const handleExport = () => {
    const record = {};
    for (const [key, value] of Object.entries(tpl)) {
      // @ts-ignore
      const p = value.filter((t: Tpl) => t.type > 0);
      if (p.length > 0) {
        // @ts-ignore
        record[key] = p;
      }
    }
    const str = JSON.stringify(record);
    if (str.length > 2) {
      message.success('所有自定义模板已经复制到剪切板，请注意保存！');
      copyToClipboard(str);
    } else {
      message.warn('没有自定义模板可以导出');
    }
  };

  const handleSelect = (apiList: Array<ApiInterface>) => {
    setSelectApiList([...apiList]);
  };

  return (
    <div>
      {isEmpty == null ? (
        <div
          style={{
            transform: 'translate(-50%, -50%)',
            position: 'fixed',
            top: '40%',
            left: '50%',
          }}
        >
          <Spin tip="加载中" size="large" />
        </div>
      ) : isEmpty ? (
        <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className={styles.layout}>
          <div className={styles.layoutLeft}>
            <Tree items={project?.modules ?? []} onSelect={handleSelect} />
          </div>
          <div className={styles.layoutRight} ref={layoutRightRef}>
            <div className={styles.layoutRightTop}>
              <div>
                <Space>
                  <>
                    <DialogApi
                      project={project}
                      items={selectApiList}
                      visible={visibleDialogApi}
                      onChangeVisible={(v) => {
                        setVisibleDialogApi(v);
                      }}
                    />
                    <Button
                      type="primary"
                      disabled={selectApiList.length === 0}
                      onClick={() => {
                        setVisibleDialogApi(true);
                      }}
                    >
                      生成(API)
                    </Button>
                  </>
                  <>
                    <DialogReqResp
                      project={project}
                      items={selectApiList}
                      visible={visibleDialogReqResp}
                      onChangeVisible={(v) => {
                        setVisibleDialogReqResp(v);
                      }}
                    />
                    <Button
                      type="primary"
                      disabled={selectApiList.length === 0}
                      onClick={() => {
                        setVisibleDialogReqResp(true);
                      }}
                    >
                      生成(请求参数 | 响应数据)
                    </Button>
                  </>
                  <Button type="primary" onClick={handleExport}>
                    <Tooltip title="模板数据全部存储在浏览器本地，清除缓存之后，所有自定义模板将会丢失，导出模板，自己保存。">
                      <QuestionCircleOutlined />
                    </Tooltip>
                    导出模板
                  </Button>
                  <Modal
                    title="模板导入"
                    okText="确定"
                    cancelText="取消"
                    visible={visibleImport}
                    onOk={() => {
                      if (importText.trim().length === 0) {
                        return message.error('模板不能为空');
                      }
                      dispatch?.({
                        type: 'tpl/import',
                        payload: {
                          value: importText,
                          success() {
                            setImportText('');
                            setVisibleImport(false);
                            message.success('导入成功');
                          },
                        },
                      });
                    }}
                    onCancel={() => setVisibleImport(false)}
                  >
                    <Alert
                      message="注意"
                      description="导入已经存在或者重复的模板，导入的模板会覆盖已有的模板！"
                      type="warning"
                      style={{ marginBottom: 10 }}
                      showIcon
                    />
                    <TextArea
                      rows={6}
                      value={importText}
                      onChange={(e: Event) => setImportText(e.target.value)}
                      placeholder="将导出的内容，复制到输入框"
                    />
                  </Modal>
                  <Button type="primary" onClick={() => setVisibleImport(true)}>
                    导入模板
                  </Button>
                </Space>
              </div>
              <div>
                <h3>{project?.label}</h3>
              </div>
            </div>
            <div className={styles.layoutRightContent}>
              {selectApiList.length === 0 ? (
                <Result icon={<SmileOutlined />} title="请先选择API" />
              ) : (
                <div className={styles.apiWrap}>
                  {selectApiList.map((api) => (
                    <div className={styles.apiItem} key={api.uid}>
                      <div className={styles.apiTop}>
                        <Alert
                          type="info"
                          description={
                            <Space size={20}>
                              <Tag
                                color="#61affe"
                                style={{
                                  width: '80px',
                                  padding: '6px 0',
                                  fontSize: '16px',
                                  textAlign: 'center',
                                }}
                              >
                                <strong>{api.method?.toUpperCase()}</strong>
                              </Tag>
                              <span className="f16">{api.url}</span>
                              <strong className="f16">{api.label}</strong>
                            </Space>
                          }
                        />
                        <div style={{ marginTop: '10px' }}>
                          请求数据类型：{api.requestContentType}
                        </div>
                      </div>
                      <div className={styles.apiContent}>
                        <Collapse defaultActiveKey={['0']}>
                          <Panel header="API方法" key="1">
                            <Space size={16} className={styles.detailCodeBox}>
                              {generateTpl(apiTpl.value, [api], {
                                onlyApi: true,
                                ...project.options,
                              })
                                .filter((t, i) => {
                                  if (apiTpl.uid !== 'API_TPL1000') {
                                    return true;
                                  }
                                  return i < 1;
                                })
                                .filter((t) => t)
                                .map((s) => (
                                  <CodeBox code={s} />
                                ))}
                            </Space>
                          </Panel>
                          <Panel header="请求参数" key="2">
                            <Space size={16} className={styles.detailCodeBox}>
                              {generateTpl(
                                REQ_RESP_TPL6000,
                                api,
                                api.requests,
                                [],
                              )
                                .filter((t) => t)
                                .map((s) => (
                                  <CodeBox code={s} />
                                ))}
                            </Space>
                          </Panel>
                          <Panel header="响应参数" key="3">
                            <Space size={16} className={styles.detailCodeBox}>
                              {generateTpl(
                                REQ_RESP_TPL6000,
                                api,
                                [],
                                api.responses,
                              )
                                .filter((t) => t)
                                .map((s) => (
                                  <CodeBox code={s} />
                                ))}
                            </Space>
                          </Panel>
                        </Collapse>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default connect((state: IndexModelState) => ({
  tpl: state.tpl,
  apiTplList: state.tpl.api,
  swaggerList: state.swagger.list,
}))(DetailPage);
