import { v4 as uuidv4 } from 'uuid';
import { camelCase } from 'change-case';
import {
  Api,
  Field,
  FieldInterface,
  Project,
  ProjectModule,
  SchemaInterface,
  ParameterInterface,
  ProjectModuleInterface,
} from '@/core/types.ts';
import { getSwagger } from '@/api';
import SwaggerParser from '@apidevtools/swagger-parser';
import { message } from 'antd';
import _, { cloneDeep } from 'lodash';
import { listToTree, treeToList } from '@/utils/tree';

const template = require('@/utils/art-template');
// @ts-ignore
if (window.template == null) { window.template = template; }
template.defaults.escape = false;
template.defaults.minimize = false;

export class Tpl {
  // 模板的唯一ID
  uid = uuidv4()
  // 模板名称
  name = ''
  // 模板类型(小于0: 代表系统内置 , 大于0: 代表自定义)
  type = 1
  // 模板内容
  value = ''
  // 默认模板
  isDefault = false
  constructor(name = '', value = '', type = 1, isDefault = false, uid = uuidv4()) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.isDefault = isDefault;
    this.uid = uid;
  }
}


const filterType = (type = ''): string => {
  switch (type) {
    case 'integer': case 'int': case 'float': case 'double':
      return 'number';
    default:
      return type;
  }
};

export const generateRequestMethodNameByUrl = (url = '', method: string, num = 1): string => {
  const urlPath = (url.replace(/\/\{.*?\}/gim, '')).split('/');
  const lastUrlPath = urlPath.slice(urlPath.length - num, urlPath.length).join(' ');
  if (lastUrlPath) {
    if (method) {
      return camelCase(`${method} ${lastUrlPath}`);
    } else {
      return camelCase(lastUrlPath);
    }
  }
  return 'api';
};

const getDefaultValue = (field: FieldInterface) => {
  const type = field.type;
  let result = null;
  if (type === 'number') {
    let text = typeof field.example === 'number' ? field.example : null;
    if (!text && field.label) {
      const rex = /[0-9]/.exec(field.label);
      if (rex && !Number.isNaN(Number.parseFloat(rex[0]))) { // @ts-ignore
        text = Number.parseFloat(rex[0]);
      }
      if (typeof text === 'number') {
        result = text;
      }
    }
  } else if (type === 'string') {
    result = '\'\'';
  } else if (type === 'boolean') {
    result = typeof field.example === 'boolean' ? field.example : false;
  } else if (type === 'object') {
    result = '{}';
  } else if (type === 'array') {
    result = '[]';
  }
  return result;
};

const schemaToTree = (schema: SchemaInterface, parentUid: string | null = null): Array<FieldInterface> => {
  let items: any;
  const _schemaToTree = (schema: SchemaInterface, parentUid: string | null = null, memo: Array<object>): Array<FieldInterface> => {
    const result: Array<FieldInterface> = [];
    if (!schema || memo.includes(schema)) {
      return result;
    }
    memo.push(schema);
    let {
      properties = {},
      required = [],
    } = schema;
    if (schema.type === 'array') {
      // @ts-ignore
      properties = schema.items.properties ?? {};
      // @ts-ignore
      required = schema.items.required ?? [];
    }
    for (const item of Object.entries(properties)) {
      const [key, value]: any = item;
      const field = new Field();
      const type = value.type;
      field.uid = uuidv4();
      // @ts-ignore
      field.parentUid = parentUid;
      field.key = key;
      field.label = value.description;
      field.type = filterType(type);
      field.typeValue = filterType(field.type); // @ts-ignore
      field.defaultValue = getDefaultValue(field);
      // todo 待确认
      // field.description = '';
      field.required = required.includes(key);
      // todo 待确认
      // field.example = '';
      if (type === 'object') {
        field.type = filterType(type);
        field.children = _schemaToTree(value, field.uid, []);
        field.typeValue = 'object';
      } else if (type === 'array') {
        const subType = value?.items?.type;
        field.type = filterType(type);
        field.typeValue = 'Array';
        if (subType === 'object') {
          // 避免出现递归调用情况
          if (items !== value.items) {
            items = value.items;
            field.children = _schemaToTree(value.items, field.uid, []);
          }
          field.typeValue = 'Array<object>';
        } else if (subType) {
          field.childType = filterType(subType);
          field.typeValue = `Array<${field.childType}>`;
        }
      }
      result.push(field);
    }
    return result;
  };
  return _schemaToTree(schema, parentUid, []);
};

const parametersToTree = (parameters: Array<ParameterInterface> = []) => {
  const result: Array<FieldInterface> = [];
  parameters.forEach((value) => {
    if (value.in === 'body') { // @ts-ignore
      [].push.apply(result, schemaToTree(value.schema));
    } else {
      const field = new Field();
      const type = value.type;
      result.push(field);
      field.uid = uuidv4();
      field.key = value.name;
      field.label = value.description;
      field.type = filterType(value.type);
      field.typeValue = filterType(field.type); // @ts-ignore// @ts-ignore
      field.defaultValue = getDefaultValue(field);
      field.required = !!value.required;
      field.children = [] as Array<FieldInterface>;
      field.childType = '';
      // field.description = '';
      // field.example = '';
      if (type === 'object') {
        field.type = filterType(type); // @ts-ignore
        field.children = schemaToTree(value, field.uid); // @ts-ignore
        field.typeValue = 'object';
      } else if (type === 'array') {
        const subType = value?.items?.type;
        field.type = filterType(type);
        field.typeValue = 'Array';
        if (subType === 'object') {
          field.children = schemaToTree(value.items, field.uid);
          field.typeValue = 'Array<object>';
        } else if (subType) {
          field.childType = filterType(subType);
          field.typeValue = `Array<${field.childType}>`;
        }
      }
    }
  });
  return result;
};

export const convertSwaggerData = (apiSource: any): any => {
  const { tags, paths } = apiSource;
  const apiList = Object.entries(paths);
  const result: Array<ProjectModuleInterface> = [];
  const version = apiSource.swagger ?? apiSource.openapi;
  const isV3 = !!version?.startsWith('3');
  for (const tag of tags) {
    const tagName = tag.name;
    const projectModule = new ProjectModule();
    const recordMethodName = new Map();
    projectModule.uid = uuidv4();
    projectModule.label = tagName;
    projectModule.description = tag.description ?? '';
    result.push(projectModule);
    for (const [path, value] of apiList) {
      // @ts-ignore
      const methods = Object.entries(value);
      for (let i = 0; i < methods.length; i++) {
        const nowApi = new Api();
        const method = (methods[i][0] || '').toLocaleString();
        const api = methods[i][1];
        // @ts-ignore
        const apiTags = api.tags;
        // 路由和属于的模块匹配命中
        if (!apiTags.includes(tagName)) {
          continue;
        }
        nowApi.requestContentType = 'application/json';
        // @ts-ignore
        projectModule.apiList.push(nowApi);
        // @ts-ignore
        const responsesSchema = isV3 ? api?.responses['200']?.content?.['application/json']?.schema : api?.responses['200']?.schema;
        // @ts-ignore
        if (api?.consumes?.[0]) { // @ts-ignore
          nowApi.requestContentType = api.consumes[0];
        }
        // schemaToTree
        nowApi.uid = uuidv4();
        nowApi.parentUid = projectModule.uid;
        nowApi.method = method;
        nowApi.name = generateRequestMethodNameByUrl(path);
        nowApi.methodName = generateRequestMethodNameByUrl(path, method);
        nowApi.requests = [];
        // @ts-ignore
        nowApi.responses = schemaToTree(responsesSchema);
        // @ts-ignore
        nowApi.label = api.summary ?? '';
        nowApi.url = path;
        nowApi.methodUrl = path.replace(/\{/gim, '${data.');
        // 避免重复名称
        if (recordMethodName.has(nowApi.methodName)) {
          recordMethodName.set(nowApi.methodName, recordMethodName.get(nowApi.methodName) + 1);
          nowApi.methodName = `${nowApi.methodName}${recordMethodName.get(nowApi.methodName)}`;
        } else {
          recordMethodName.set(nowApi.methodName, 0);
        }
        // 请求参数【parameters】
        // @ts-ignore
        if (Array.isArray(api.parameters)) {
          // @ts-ignore
          [].push.apply(nowApi.requests, parametersToTree(api.parameters));
          if (nowApi.requests.length > 0) {
            let countQM = 0;// @ts-ignore
            api.parameters.forEach((t: any) => {
              if (t.in === 'path' || t.in === 'query') {
                countQM++;
              }
            });
            // @ts-ignore
            if (countQM === api.parameters.length) {
              nowApi.requestContentType = 'application/x-www-form-urlencoded';
            }
          }
        }
        // 请求参数【requestBody】
        if (isV3) {
          // @ts-ignore
          const requestSchema = api.requestBody?.content?.['application/json']?.schema;
          if (requestSchema) {
            // @ts-ignore
            [].push.apply(nowApi.requests, schemaToTree(requestSchema));
          }
        }
      }
    }
  }
  // 增加测试用例
  // result.unshift(new TestProjectModule());
  return result;
};

export const swaggerParser = async (param: Project, showErrorMsg = true) => {
  const data = await getSwagger(param);
  // @ts-ignore
  window.swaggerVersion = data.swagger ?? data.openapi;
  const api = await new SwaggerParser().dereference(data);
  if (!api?.swagger && !api.openapi) {
    const errText = 'Swagger配置文件错误';
    showErrorMsg && message.error(errText);
    throw Error(errText);
  }
  const modules = convertSwaggerData(api);
  if (modules.length === 0) {
    const errText = '没有模块可以生成';
    showErrorMsg && message.error(errText)
    throw Error(errText);
  }
  let baseURL = '';
  const result = Object.assign({}, new Project(), param);
  result.modules = modules;
  result.label = api.info.title;
  if (api?.openapi?.startsWith('3.')) {
    if (api?.servers?.length > 0) {
      baseURL = (api.servers[0].url ? `'${api.servers[0].url}'` : '')
    }
  } else {
    baseURL = (api.basePath ? `'${api.basePath}'` : '')
  }
  result.baseURL = baseURL;
  return result;
}

export const generateTpl = function(tpl: string, ...params: Array<any>) {
  let result: Array<string> = [];
  const success = params[params.length - 1];
  if (typeof success === 'function') {
    params.pop();
  }
  try {
    const lodash = _;
    const exe = { renderTpl: null };
    eval(tpl + `\nexe.renderTpl = typeof renderTpl === 'function' ? renderTpl : null`);
    if (typeof exe.renderTpl !== 'function') {
      throw Error('模板中缺少 renderTpl 函数');
    }
    // @ts-ignore
    result = exe.renderTpl.apply(null, params);
    if (!Array.isArray(result)) {
      throw Error('renderTpl 函数返回值数据类型为： Array<string>');
    }
    if (result.length === 0) {
      result = ['没有可以生成的模板']
    } else if (typeof result[0] !== 'string') {
      throw Error('renderTpl 函数返回值数据类型为： Array<string>');
    }
    if (typeof success === 'function') {
      success?.();
    }
  } catch (e: any) {
    if (typeof e === 'string') {
      result = [e];
      message.error(e);
    } else if (typeof e?.message === 'string') {
      result = [e.message];
      message.error(e.message);
    }
  }
  return result;
}

export const processFieldTree = (source:Array<FieldInterface>, value:Array<FieldInterface>) => {
  if (value.length <= 1) {
    return value;
  }
  const memo = {}; // @ts-ignore
  treeToList(cloneDeep(source)).forEach((t) => { memo[t.uid] = t });
  const res = [];
  const parents = {};
  const uidList = new Set();
  value.forEach((p) => {
    const u = p.uid;
    uidList.add(u);
    while (p) {
      if (Array.isArray(parents[u])) {
        parents[u].push(p.parentUid);
      } else {
        parents[u] = [p.parentUid];
      }
      p = memo[p.parentUid];
    }
  });
  let removeCount = 0;
  let isBreak = false;
  let record = '';
  const t = Object.entries(parents);
  while (true) {
    for (let i = 0; i < t.length; i++) {
      const [k, v] = t[i];
      const n = v[v.length - (removeCount + 1)];
      if (i === 0) {
        record = n;
      }
      if (n === undefined || n !== record) {
        isBreak = true;
        break;
      }
      if (i === t.length - 1) {
        removeCount++;
      }
    }
    if (isBreak) {
      break;
    }
  }
  if (removeCount) {
    for (const [k, v] of Object.entries(parents)) {
      // @ts-ignore
      v.splice(v.length - removeCount, v.length);v.forEach((uid) => uidList.add(uid));
    }
  }
  uidList.forEach((uid: string) => {
    res.push(memo[uid])
  });
  return listToTree(res, { id: 'uid', pid: 'parentUid' });
};
