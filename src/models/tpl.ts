import { v4 as uuidv4 } from 'uuid';
import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';
import { Tpl } from '@/core';
import { cloneDeep, findIndex } from 'lodash';
import { API_TPL1000 } from '@/constants/tpl/api';
import { REQ_RESP_TPL2000, REQ_RESP_TPL2100, REQ_RESP_TPL6000 } from '@/constants/tpl/req-resp';
import { message } from 'antd';
import { checkType } from '@/utils';
import { TPL_MODEL_STATE } from '@/constants';

export interface TplModelState {
  // API方法相关的模板
  api: Array<Tpl>
  reqResp: Array<Tpl>
}

export interface TplModelType {
  namespace: 'tpl';
  state: TplModelState;
  effects: {
    query: Effect;
  };
  reducers: {
    add: Reducer<TplModelState>;
  };
  subscriptions: { setup: Subscription };
}

const TplModel: TplModelType = {
  namespace: 'tpl',

  state: TPL_MODEL_STATE,

  reducers: {
    add(state: TplModelState, action: any) {
      const { type, value } = action.payload;
      if (type) {
        state?.[type]?.push(value);
      }
      return {...state, [type]: [...state[type]]}
    },
    delete(state: TplModelState, action: any) {
      const { type, value } = action.payload;
      // @ts-ignore
      if (state[type]) { // @ts-ignore
        const index = findIndex(state[type], (t: Tpl) => t.uid === value.uid);
        if (index !== -1) { // @ts-ignore
          state[type].splice(index, 1);
        }
      }
      return {...state};
    },
    deleteAll(state: TplModelState, action: any) {},
    setDefault(state: TplModelState, action: any) {
      const { type, value } = action.payload;
      if (type && state?.[type] && value) {
        state?.[type]?.forEach((t: Tpl) => {
          t.isDefault = t.uid === value;
        });
      }
      return {...state, [type]: [...state[type]]};
    },
    update(state: TplModelState, action: any) {
      const { type, value } = action.payload;
      if (type && state?.[type] && value) {
        const item = state?.[type]?.find((t) => t.uid === value.uid);
        if (item) {
          const index = state?.[type]?.indexOf(item);
          state?.[type]?.splice(index, 1, {...value});
        }
      }
      return {...state, [type]: [...state[type]]}
    },
    import(state: TplModelState, action: any) {
      let hasImport = false;
      const memo = {}; // @ts-ignore
      for (const [k, v] of Object.entries(state)) { memo[k] = {}; v.forEach((t: Tpl) => memo[k][t.uid] = t);}
      try {
        const p = JSON.parse(action.payload.value);
        if (!checkType(p, 'Object')) {
          message.error('格式错误');
        } else {
          for (const [k, v] of Object.entries(p)) {
            // 该类型模板存在
            if (memo.hasOwnProperty(k)) { // @ts-ignore
              v.forEach((t: Tpl) => { // @ts-ignore
                // 已存在，进行覆盖
                if (memo[k][t.uid]) { // @ts-ignore
                  state[k].splice(state[k].indexOf(memo[k][t.uid]), 1, t);
                  hasImport = true;
                } else { // 不存在添加
                  // @ts-ignore
                  state[k].push(t);
                  hasImport = true;
                }
              })
            }
          }
        }
      } catch {
        message.error('导入失败');
        return state;
      }
      if (hasImport) {
        action.payload.success();
      } else {
        message.info('没有可以导入的模板');
      }
      return { ...state };
    },
    checkUpdate(state) {
      for (const [k, v] of Object.entries(TPL_MODEL_STATE)) {
        if (state.hasOwnProperty(k)) {
          v.forEach((t) => {
            const index = findIndex(state[k], ((item: Tpl) => item.uid === t.uid));
            if (index !== -1) {
              state[k].splice(index, 1, {
                ...state[k][index],
                name: t.name,
                value: t.value,
              });
            } else {
              state[k].push(t);
            }
          });
        } else {
          state[k] = v;
        }
      }
      return {...state};
    }
  },
};

export default TplModel;
