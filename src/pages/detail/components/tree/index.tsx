import React, { FC, useState, useEffect } from 'react';
import { IndexModelState, ConnectProps, Loading, connect, Link, useParams } from 'umi';
import { Tree, Spin, Empty, Form, Input, Modal, Space, Table, Button, message, Popconfirm } from 'antd';
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons';
import SwaggerParser from '@apidevtools/swagger-parser';
import { getSwagger, importSwagger } from '@/api';
import { cloneDeep, merge } from 'lodash';
import { ApiInterface, ProjectModuleInterface } from '@/core/types';
import { convertSwaggerData, swaggerParser } from '@/core';
import styles from './index.scss';
import ex from 'umi/dist';

interface DetailPageUrlParams { uid: string | undefined }
interface DetailPageProps {
  items: Array<ProjectModuleInterface>
  onSelect(): void
  key: string
}
const DetailPage: FC<DetailPageProps> = ({items, onSelect, key='uid'}) => {
  const [expandUidList, setExpandUidList] = useState<Array<string>>([]);
  const [selectRootKey, setSelectRootKey] = useState<string|null>(null);
  const [selectSubKeys, setSelectSubKeys] = useState<Array<string>>([]);
  const [selectSubParentKey, setSelectSubParentKey] = useState<string|null>('');

  const handleExpand = (uid: string, e: Event) => {
    e.stopPropagation();
    const index = expandUidList.indexOf(uid);
    if (index !== -1) {
      expandUidList.splice(index, 1);
    } else {
      expandUidList.push(uid);
    }
    setExpandUidList([...expandUidList]);
  };
  const handleSubSelect = (rootNode: ProjectModuleInterface, uid: string, e: Event) => {
    e.stopPropagation();
    const parentUid = rootNode.uid;
    if (parentUid === selectSubParentKey) {
      const index = selectSubKeys.indexOf(uid);
      if (index !== -1) {
        selectSubKeys.splice(index, 1);
        if (selectSubKeys.length === 0) {
          setSelectSubParentKey(null);
        }
      } else {
        selectSubKeys.push(uid);
      }
    } else {
      selectSubKeys.splice(0, selectSubKeys.length);
      selectSubKeys.push(uid);
      setSelectSubParentKey(parentUid);
    }
    const rootKey = null;
    setSelectSubKeys([...selectSubKeys]);
    // 清空已经选择的Root节点
    setSelectRootKey(rootKey);
    const res = selectSubKeys.map((k) => rootNode.apiList.find((t) => t.uid === k)).filter((t) => t);
    // 执行回调
    onSelect(res);
  };
  const handleRootSelect = (rootNode: ProjectModuleInterface, e: Event) => {
    e.stopPropagation();
    const { uid, apiList } = rootNode;
    const isSelect = selectRootKey === uid;
    const rootKey = isSelect ? null : uid;
    // 清空所有子级选择
    selectSubKeys.splice(0, selectSubKeys.length);
    if (!isSelect) {
      setSelectSubParentKey(uid);
      apiList.forEach((t) => selectSubKeys.push(t.uid));
      if (!expandUidList.includes(uid)) {
        expandUidList.push(uid);
        setExpandUidList([...expandUidList]);
      }
    } else {
      setSelectSubParentKey('');
    }
    setSelectSubKeys([...selectSubKeys]);
    setSelectRootKey(rootKey);
    const res = selectSubKeys.map((k) => rootNode.apiList.find((t) => t.uid === k)).filter((t) => t);
    // 执行回调
    onSelect(res);
  };

  return(
    <div className={styles.treeWrap}>
      { items.map((item) => (
        // @ts-ignore
        <div className={styles.treeItem} key={item[key]}>
          <div
            className={[styles.treeLabel, selectRootKey === item.uid || selectSubParentKey === item.uid ? styles.treeLabelActive : null].join(' ')}
          >
            <div>
              <div className={styles.treeLabelText} onClick={(e: Event) => handleRootSelect(item, e)}>
                <span>{item.label}</span>
                {item.description && <span className="f10 text-ellipsis" style={{fontWeight: '400', marginTop: '0px', display: 'inline-block'}}>{item.description}</span>}
              </div>
              <div>
                {selectSubParentKey === item.uid && selectSubKeys.length > 0 &&
                <div>
                  {selectSubKeys.length}
                </div>}
              </div>
            </div>
            {item.apiList && item.apiList.length > 0 &&
            <div
              className={expandUidList.includes(item.uid) ? styles.treeItemExpand : null}
              onClick={(e: Event) => handleExpand(item.uid, e)}>
              <DownOutlined />
            </div>
            }
          </div>
          {expandUidList.includes(item.uid) && item.apiList && item.apiList.length > 0 &&
          <div className={styles.treeContent}>
            {item.apiList.map((t) => (
              // @ts-ignore
              <div key={item[key]}
                className={[styles.treeSub, selectSubKeys.includes(t.uid) ? styles.treeSubActive : null].join(' ')}
                onClick={(e: Event) => handleSubSelect(item, t.uid, e)}
              >
                <div className={styles.treeSubLabel}>
                  <span>{t.method.toUpperCase()}</span>
                  <span>{t.label}</span>
                </div>
              </div>
            ))}
          </div>
          }
        </div>
      )) }
    </div>
  )
};

export default connect((state: IndexModelState) => ({ swagger: state.swagger }))(DetailPage);
