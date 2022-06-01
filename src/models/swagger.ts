import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';
import { Project, ProjectInterface } from '@/core/types';
import { cloneDeep, findIndex, pick } from 'lodash';

export interface SwaggerModelState {
  list: Array<ProjectInterface>;
}

export interface SwaggerModelType {
  namespace: 'swagger';
  state: SwaggerModelState;
  effects: {
    query: Effect;
  };
  reducers: {
    save: Reducer<SwaggerModelState>;
    // 启用 immer 之后
    // save: ImmerReducer<SwaggerModelState>;
  };
  subscriptions: { setup: Subscription };
}

const SwaggerModel: SwaggerModelType = {
  namespace: 'swagger',

  state: {
    list: [
      new Project({
        label: '示例项目',
        url: 'https://swaggerhelper.andou.live:9527/api/test',
      }),
      new Project({
        label: '官方示例项目(Swagger Petstore - OpenAPI 2.0)',
        url: 'https://petstore.swagger.io/v2/swagger.json',
      }),
      new Project({
        label: '官方示例项目(Swagger Petstore - OpenAPI 3.0)',
        url: 'https://petstore3.swagger.io/api/v3/openapi.json',
      }),
    ],
  },

  effects: {
    *query({ payload }, { call, put }) {},
  },
  reducers: {
    add(state: SwaggerModelState, action: any) {
      return { ...state, list: [action.payload, ...state.list] };
    },
    delete(state: SwaggerModelState, action: any) {
      const index = state.list.indexOf(action.payload);
      if (index !== -1) {
        state.list.splice(index, 1);
      }
      return cloneDeep(state);
    },
    deleteAll(state: SwaggerModelState, action: any) {
      return { ...state, list: [] };
    },
    update(state: SwaggerModelState, action: any) {
      const project = action?.payload?.project;
      const data = action?.payload?.data;
      if (project && data) {
        const index = findIndex(state.list, (t) => t.uid === project.uid);
        if (index !== -1) {
          state.list.splice(
            index,
            1,
            Object.assign({}, state.list[index], data),
          );
        }
      }
      return { ...state, list: [...state.list] };
    },
    updateOptions(state: SwaggerModelState, action: any) {
      const project = action?.payload?.project;
      const data = action?.payload?.data;
      if (project && data) {
        const index = findIndex(state.list, (t) => t.uid === project.uid);
        if (index !== -1) {
          const item = state.list[index];
          item.options = Object.assign(item.options, data);
        }
      }
      return { ...state };
    },
    // 启用 immer 之后
    // save(state, action) {
    //   state.name = action.payload;
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({
            type: 'query',
          });
        }
      });
    },
  },
};

export default SwaggerModel;
