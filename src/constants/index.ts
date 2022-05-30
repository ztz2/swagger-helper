import { API_TPL1000 } from '@/constants/tpl/api';
import {
  REQ_RESP_TPL2000,
  REQ_RESP_TPL2001,
  REQ_RESP_TPL2100,
  REQ_RESP_TPL2101,
  REQ_RESP_TPL5000,
  REQ_RESP_TPL6000,
  REQ_RESP_TPL6001,
} from '@/constants/tpl/req-resp';
import { Tpl } from '@/core';

export const FILTER_REQUEST_FIELD = ['pageSize', 'pageNumber', 'createdBy', 'createdAt', 'changedBy', 'changedAt', 'version', 'deleted', 'paged', 'unpaged', 'offset'];
export const SECRET_KEY = 'JK#3212%SFKKNSDSFSDKFJLJKLHJSDJUWSD';
export const FIELD_NAMES = { title: 'key', key: 'uid', }

export const TPL_MODEL_STATE = {
  api: [
    new Tpl('内置(API模板)', API_TPL1000, -1, true, 'API_TPL1000'),
  ],
  reqResp: [
    new Tpl('内置(Vue-表格模板[element-ui表格])', REQ_RESP_TPL2000, -1, true, 'REQ_RESP_TPL2000'),
    new Tpl('内置(Vue-表格模板[通用表格组件])', REQ_RESP_TPL2001, -1, false, 'REQ_RESP_TPL2001'),

    new Tpl('内置(Vue-实体类模板[通用表单组件])', REQ_RESP_TPL2100, -1, false, 'REQ_RESP_TPL2100'),
    new Tpl('内置(Vue-实体类模板[element-ui表单])', REQ_RESP_TPL2101, -1, false, 'REQ_RESP_TPL2101'),

    new Tpl('内置(TS-请求数据&响应数据[Interface])', REQ_RESP_TPL5000, -1, false, 'REQ_RESP_TPL5000'),

    new Tpl('内置(请求参数&响应参数[对象])', REQ_RESP_TPL6000, -1, false, 'REQ_RESP_TPL6000'),
    new Tpl('内置(请求参数&响应参数[Class])', REQ_RESP_TPL6001, -1, false, 'REQ_RESP_TPL6001'),
  ]
}
