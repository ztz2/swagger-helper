import { v4 as uuidv4 } from 'uuid';

// 字段
export interface FieldInterface {
  // 字段
  key: string;
  // label
  label: string;
  // 字段类型
  type: string;
  // 类型值
  typeValue: string;
  // 它的子集字段【当该字段为Object或者Array<object>】
  children: Array<FieldInterface>;
  // 它的子集为基本数据类型时候的值
  childType: string | null;
  // 字段描述
  description?: string;
  // 是否必填字段
  required: boolean;
  // 例子
  example: string;
  // 默认值
  defaultValue: any;
  // 唯一ID
  uid: string;
  // 父节点
  parentUid: string | null;
}
export class Field implements FieldInterface {
  key = '';
  label = '';
  type = '';
  typeValue = '';
  children = [] as Array<FieldInterface>;
  childType = '';
  description = '';
  required = false;
  example = '';
  defaultValue = null;
  uid = uuidv4();
  parentUid = null;
}

// API
export interface ApiInterface {
  // 接口名称
  label: string;
  // 接口地址
  url: string;
  // 根据URL生成的接口名称
  name: string;
  // 生成的接口地址
  methodUrl: string;
  // 唯一的UID
  uid: string;
  // 父节点UID
  parentUid: string;
  // 接口请求方法
  method: string;
  // 生成的接口请求方法名称
  methodName: string;
  // 请求数据类型
  requestContentType: string;
  // 请求数据字段集合
  requests: Array<FieldInterface>;
  // 响应数据字段集合
  responses: Array<FieldInterface>;
}

export class Api implements ApiInterface {
  uid = '';
  name = '';
  parentUid = '';
  method = '';
  methodName = '';
  requests = [];
  requestContentType = '';
  responses = [];
  label = '';
  url = '';
  methodUrl = '';
}

// 模块
export interface ProjectModuleInterface {
  uid: string;
  label: string;
  description: string;
  apiList: Array<ApiInterface>;
}
export class ProjectModule implements ProjectModuleInterface {
  uid = '';
  label = '';
  description = '';
  apiList = [];
  constructor(label = '') {
    this.uid = uuidv4();
    this.label = label;
  }
}

export class ProjectOptions {
  // baseURL
  baseURL = '';
  // 是否只生成API接口函数方法
  onlyApi = false;
  // 是否增加取消重复请求配置
  cancelSameRequest = false;
  // 一些头部模板文本
  headText = `import request from '@/utils/request'`;

  // 是否生成分号
  semi = true;
  // 是否生成CRUD
  crud = false;
  // 是否使用格栅布局
  grid = false;
  // 输入框属性
  maxlength = 100;
  // 输入框是否生成placeholder
  placeholder = false;
  // 表单是否生成label
  generateLabel = false;
}

// 项目
export interface ProjectInterface {
  // 项目唯一ID
  uid: string;
  // 项目名称
  label: string;
  // 项目Swagger配置地址
  url: string;
  // 项目Swagger配置请求用户名
  username: string;
  // 项目Swagger配置请求密码
  password: string;
  // 项目模块
  modules: Array<ProjectModuleInterface>;
  // 当前项目的一些可选项配置
  options: ProjectOptions;
}
export class Project implements ProjectInterface {
  uid = uuidv4();
  label = '';
  url = '';
  modules = [];
  username = '';
  password = '';
  options = new ProjectOptions();
  constructor(props: object = {}) {
    const keys = Object.keys(this);
    for (const [k, v] of Object.entries(props)) {
      if (keys.includes(k)) {
        // @ts-ignore
        this[k] = v;
      }
    }
  }
}

export interface ParameterInterface {
  example: any;
  in: string;
  // 字段
  name: string;
  // 字段类型
  type: string;
  // 字段描述
  description: string;
  // 必填
  required: boolean;
  allowEmptyValue: boolean;
  format: string;
  schema: any;
  items: any;
}

export interface SchemaInterface {
  originalRef: string;
  properties: {
    [propName: string]: SchemaInterface;
  };
  required: Array<string>;
  title: string;
  type: string;
}
