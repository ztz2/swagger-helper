import { v4 as uuidv4 } from 'uuid';

// 字段
export interface FieldInterface {
  // 字段
  key: string
  // label
  label: string
  // 字段类型
  type: string
  // 类型值
  typeValue: string
  // 它的子集字段【当该字段为Object或者Array<object>】
  children: Array<FieldInterface>
  // 它的子集为基本数据类型时候的值
  childType: string | null
  // 字段描述
  description?: string
  // 是否必填字段
  required: boolean
  // 例子
  example: string
  // 默认值
  defaultValue: any
  // 唯一ID
  uid: string
  // 父节点
  parentUid: string | null
  _options: {
    disableCheckbox: boolean
  }
}
export class Field implements FieldInterface {
  key = ''
  label = ''
  type = ''
  typeValue = ''
  children = [] as Array<FieldInterface>
  childType = ''
  description = ''
  required = false
  example = ''
  defaultValue = null
  uid = uuidv4()
  parentUid = null
  _options = {
    disableCheckbox: false
  }
}

// API
export interface ApiInterface {
  uid: string
  parentUid: string
  method: string
  methodName: string
  requestContentType: string
  requests: Array<FieldInterface>
  responses: Array<FieldInterface>
  label: string,
  url: string
  methodUrl: string
  _options: {
    active: boolean
  }
}
export class Api implements ApiInterface {
  uid = ''
  parentUid = ''
  method = ''
  methodName = ''
  requests = []
  requestContentType = ''
  responses = []
  label = ''
  url = ''
  methodUrl = ''
  _options = {
    active: false
  }
}

// 模块
export interface ProjectModuleInterface {
  uid: string
  label: string
  description: string
  apiList: Array<ApiInterface>
  _options: {
    active: boolean
  }
}
export class ProjectModule implements ProjectModuleInterface {
  uid = ''
  label = ''
  description = ''
  apiList = []
  _options = {
    active: false
  }
  constructor(label = '') {
    this.uid = uuidv4();
    this.label = label;
  }
}

// 项目
export interface ProjectInterface {
  uid: string
  label: string
  url: string
  text: string
  type: number
  version: string | null
  isSameVersion: boolean
  baseURL: string
  headText: string
  username: string
  password: string
  maxlength: number
  generateLabel: boolean
  modules: Array<ProjectModuleInterface>
}
export class Project implements ProjectInterface {
  uid = uuidv4()
  url = ''
  text = ''
  type = 1
  label = ''
  modules = []
  baseURL = ''
  headText = `import request from '@/utils/request'`
  version = null
  isSameVersion = true
  maxlength = 100
  generateLabel = false
  username = ''
  password = ''
  constructor(label?: string, url?: string, baseURL = '') {
    this.label = label || '';
    this.url = url || '';
    this.baseURL = baseURL;
  }
}

export interface ParameterInterface {
  example: any;
  in: string
  // 字段
  name: string
  // 字段类型
  type: string
  // 字段描述
  description: string
  // 必填
  required: boolean
  allowEmptyValue: boolean
  format: string
  schema: any
  items: any
}

export interface SchemaInterface {
  originalRef: string
  properties: {
    [propName: string]: SchemaInterface
  }
  required: Array<string>
  title: string
  type: string
}
