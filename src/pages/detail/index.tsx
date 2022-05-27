import React, { FC, useState, useEffect, useRef } from 'react';
import { IndexModelState, ConnectProps, Loading, connect, Link, useParams } from 'umi';
import { Result, Alert, Tag, Collapse, Menu, Spin, Empty, Form, Input, Modal, Space, Table, Button, message, Popconfirm } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import SwaggerParser from '@apidevtools/swagger-parser';
import { getSwagger, importSwagger } from '@/api';
import { cloneDeep, merge } from 'lodash';
import { ApiInterface, Project, ProjectModuleInterface } from '@/core/types';
import { convertSwaggerData, swaggerParser } from '@/core';
import {
  generateApiTpl as gat,
  generateEntityField as gef,
} from '@/core/template';

import CodeBox from '@/components/code-box';
import Tree from './components/tree/index';
import DialogApi from './components/dialog-api';
import styles from './index.scss';

const { Panel } = Collapse;

interface DetailPageUrlParams { uid: string | undefined }
interface DetailPageProps extends ConnectProps { swagger: IndexModelState }
const DetailPage: FC<DetailPageProps> = ({swagger, dispatch}) => {
  const urlParams: DetailPageUrlParams = useParams();
  const layoutRightRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState<null|boolean>(null);
  const [project, setProject] = useState<Project>(new Project());
  const [selectApiList, setSelectApiList] = useState<Array<ApiInterface>>([]);
  const [visibleDialogApi, setVisibleDialogApi] = useState<boolean>(false);


  useEffect(() => {
    const { uid } = urlParams;
    const s = swagger.list.find((t: Project) => t.uid === uid);
    if (!s) {
      setIsEmpty(true);
    }
    swaggerParser(s).then((p: Project) => {
      setIsEmpty(false);
      setProject(p);
      console.log('详情数据：', p);
    }).catch(() => setIsEmpty(true));
  }, []);

  useEffect(() => { // @ts-ignore
    if (layoutRightRef && layoutRightRef.current) { layoutRightRef.current.scrollTop = 0;}
  }, [selectApiList])
  const handleSelect = (apiList: Array<ApiInterface>) => {
    setSelectApiList(apiList);
  }

  return(
    <div>
      {
        isEmpty == null ? <div style={{transform: 'translate(-50%, -50%)', position: 'fixed', top: '40%', left: '50%'}}><Spin tip="加载中" size="large" /></div>
          : isEmpty ? <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <div className={styles.layout}>
              <div className={styles.layoutLeft}>
                <Tree
                  items={project?.modules ?? []}
                  onSelect={handleSelect}
                />
              </div>
              <div className={styles.layoutRight} ref={layoutRightRef}>
                <div className={styles.layoutRightTop}>
                  <div>
                    <Space>
                      <>
                        <DialogApi project={project} items={selectApiList} visible={visibleDialogApi} onChangeVisible={(v) => { setVisibleDialogApi(v) }} />
                        <Button type="primary" disabled={selectApiList.length === 0} onClick={() => setVisibleDialogApi(true)}>生成API</Button>
                      </>
                      <Button type="primary">模板生成API</Button>
                      <Button type="primary">模板生成API</Button>
                      <Button type="primary">模板生成API</Button>
                    </Space>
                  </div>
                  <div>
                    <h3>{project?.label}</h3>
                  </div>
                </div>
                <div className={styles.layoutRightContent}>
                  { selectApiList.length === 0
                  ?<Result
                      icon={<SmileOutlined />}
                      title="请先选择API"
                    />
                  :<div className={styles.apiWrap}>
                    { selectApiList.map((api) => (
                      <div className={styles.apiItem}>
                        <div className={styles.apiTop}>
                          <Alert type="info" description={(
                            <Space size={20}>
                              <Tag color="#61affe" style={{width: '80px', padding: '6px 0', fontSize: '16px', textAlign: 'center'}}><strong>{api.method?.toUpperCase()}</strong></Tag>
                              <span className="f16">{api.url}</span>
                              <strong className="f16">{api.label}</strong>
                            </Space>
                          )} />
                          <div style={{marginTop: '10px'}}>
                            请求数据类型：{api.requestContentType}
                          </div>
                        </div>
                        <div className={styles.apiContent}>
                          <Collapse defaultActiveKey={['0']}>
                            <Panel header="API方法" key="1">
                              <div>
                                <CodeBox code={gat([api], { ...project, onlyApi: true })} inCollapse />
                              </div>
                            </Panel>
                            <Panel header="请求参数" key="2">
                              <div>
                                <CodeBox code={gef(api.requests)} inCollapse />
                              </div>
                            </Panel>
                            <Panel header="响应参数" key="3">
                              <div>
                                <CodeBox code={gef(api.responses)} inCollapse />
                              </div>
                            </Panel>
                          </Collapse>
                        </div>
                      </div>
                    )) }
                  </div>
                  }
                </div>
              </div>
            </div>
            )
      }
    </div>
  )
};

export default connect((state: IndexModelState) => ({ swagger: state.swagger }))(DetailPage);
