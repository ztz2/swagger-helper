import { cloneDeep } from 'lodash';

const COMMON_HEAD =
`/**
// API
interface ApiInterface {
  // 接口名称
  label: string,
  // 接口地址
  url: string
  // 根据URL生成的接口名称
  name: string
  // 生成的接口地址
  methodUrl: string
  // 唯一的UID
  uid: string
  // 父节点UID
  parentUid: string
  // 接口请求方法
  method: string
  // 生成的接口请求方法名称
  methodName: string
  // 请求数据类型
  requestContentType: string
  // 请求数据字段集合
  requests: Array<FieldInterface>
  // 响应数据字段集合
  responses: Array<FieldInterface>
}
// 请求数据&响应数据中的字段
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
}
// 可选的配置项
type Options = {
  // 是否生成分号
  semi: true,
  // baseURL
  baseURL: string
  // 是否只生成API接口函数方法
  onlyApi: boolean
  // 是否增加取消重复请求配置
  cancelSameRequest: boolean
}
 * @param apiList { Array<ApiInterface> } 选择的接口集合
 * @param options { Options= } 可选的配置项
 * @return [] { Array<string> } 返回数组，里面每一项字符串都是一个模板
 */
function renderTpl (apiList, options) {
  // 模板引擎基于 art-template 使用，template 变量就是对art-template的引用，更多语法方法参考官方文档：https://github.com/aui/art-template
  // 函数中可以使用Lodash工具包所有功能，比如 cloneDeep，使用方式：lodash.cloneDeep
  const result = [];
  options = lodash.merge({
    baseURL: '',
    onlyApi: false,
    cancelSameRequest: false
  }, lodash.isPlainObject(options) ? options : {});
`;

/**------------------------------  API方法模板--开始  ------------------------------**/
export const API_TPL1000 =
COMMON_HEAD + `
/********* 生成API函数方法 -- 开始 ***********/
const tpl1 = \`{{if !options.onlyApi}}{{if options.headText}}{{options.headText}}\n\n{{/if}}{{/if}}{{each apiList}}{{if $value.label}}// {{$value.label}}{{/if}}
export function {{$value.methodName}}(data) {
  return request({<% if (options.cancelSameRequest) { %>
    cancelSameRequest: true,<% } %>{{if options.baseURL}}
    baseURL: {{options.baseURL}},{{/if}}
    url: {{if $value.methodUrl.includes('{')}}\\\`{{else}}'{{/if}}{{$value.methodUrl}}{{if $value.methodUrl.includes('{')}}\\\`{{else}}'{{/if}},
    method: '{{$value.method}}',
    {{if $value.method === 'get' || $value.requestContentType.includes('application/x-www-form-urlencoded')}}params: data{{else}}data{{/if}}
  }){{if options.semi}};{{/if}}
}{{if $index < apiList.length - 1}}\n{{/if}}{{if $index < apiList.length - 1}}\n{{/if}}{{/each}}\n\`;

  result.push(template.render(tpl1, { apiList, options }));
  /********* 生成API函数方法 -- 结束 ***********/

  /********* 生成API函数导出方法 -- 开始 ***********/
  const sortBy = lodash.sortBy;
  apiList = sortBy(apiList, (item) => item.methodName.length);
  const tpl2 = '{{if apiList.length > 0}}import {<% for(var i = 0; i < apiList.length; i++){ %>{{if apiList[i].label}}\\n  // {{apiList[i].label}}{{/if}}\\n  <%= apiList[i].methodName %>{{if i < apiList.length - 1}},{{/if}}<% } %>\\n} from \\'@/api\\'{{if options.semi}};{{/if}}{{/if}}';
  result.push(template.render(tpl2, { apiList, options }));
  /********* 生成API函数导出方法 -- 结束 ***********/

  return result;
};
`;
/**------------------------------  API方法模板--结束  ------------------------------**/

export const API_TPL_DEMO1 = COMMON_HEAD + `
  const tpl1 =
\`生成模板例子，这里获取请求API集合，根据这些API，可以生成想要的任何模板代码
{{if apiList.length > 0}}
请求API，看看url参数和methodUrl的区别(methodUrl，使用模板字符串绑定了路径参数变量)：{{each apiList}}
   {{$value.label}}
      url：{{$value.url}}
      url：{{$value.methodUrl}}{{/each}}
{{/if}}
\`
  // 当一个模板定义好之后，使用 template.render 方法进行生成，并添加到result返回数组中
  // 当然可以生成多个模板，每次生成好之后，添加到result数组中即可
  result.push(template.render(tpl1, { apiList, options }));

  // 返回生成好的模板
  return result;
};
`;

export const getInitApiTplMockData = () => cloneDeep([{"uid":"22c63856-1c97-4e3e-a731-d4d6dec8c13e","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"post","methodName":"postUploadImage","requests":[{"key":"petId","label":"ID of pet to update","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"832e18bf-091a-42c9-9e45-31a0895f491f","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"additionalMetadata","label":"Additional data to pass to server","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"ec821e15-aab4-473f-8eec-9593831e5778","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"file","label":"file to upload","type":"file","typeValue":"file","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"3a0ba058-44c7-4467-a09b-a3ad1521e4ce","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"multipart/form-data","responses":[{"key":"code","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"ad444087-373a-4d0d-8b7f-fdb4228b0c5b","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"type","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"c4098f01-3803-4f27-9f91-ef287da84d97","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"message","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"7a52ef32-0e13-48ed-b299-a822a6d658e4","parentUid":null,"_options":{"disableCheckbox":false}}],"label":"uploads an image","url":"/pet/{petId}/uploadImage","methodUrl":"/pet/${data.petId}/uploadImage","_options":{"active":false}},{"uid":"42b4e0ea-826f-4f28-8b4c-3785915cc4d6","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"post","methodName":"postPet","requests":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"46c27d83-2a9c-455a-8689-10f0e9ac8d60","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"category","type":"object","typeValue":"object","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"cc71af24-2615-4504-9f2c-4c8451dbff5a","parentUid":"fc1bfb81-5751-4544-83aa-3e50274fc3f0","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"f7cdd638-5972-4efc-9b11-427f6d5b2485","parentUid":"fc1bfb81-5751-4544-83aa-3e50274fc3f0","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"fc1bfb81-5751-4544-83aa-3e50274fc3f0","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"2647bc71-7fe9-4830-aba5-52ca709392d1","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"photoUrls","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"6f5e4edc-f674-47b7-b1b0-6ea098763230","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tags","type":"array","typeValue":"Array<object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"ada46791-301f-4d1c-a191-d01639b020b5","parentUid":"6fab1c5d-2023-498a-ad31-bc43c301fe78","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"23ac3cf7-6407-4af6-9feb-3beefc1e15b2","parentUid":"6fab1c5d-2023-498a-ad31-bc43c301fe78","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"6fab1c5d-2023-498a-ad31-bc43c301fe78","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"pet status in the store","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"4b03343a-cde6-47ac-9d2f-a7efae9c15ac","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/json","responses":[],"label":"Add a new pet to the store","url":"/pet","methodUrl":"/pet","_options":{"active":false}},{"uid":"fed4ff80-f6ca-4be9-918f-817228e4df07","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"put","methodName":"putPet","requests":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"a26fe657-c46d-46ea-b22f-c61ea56b930e","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"category","type":"object","typeValue":"object","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"879618e0-6380-4aa6-8ac3-e9be0b690df6","parentUid":"42d8a124-462a-45f7-bd32-808da785f0fe","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"cb6d5428-a63d-4595-b0bc-7e2a95207f17","parentUid":"42d8a124-462a-45f7-bd32-808da785f0fe","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"42d8a124-462a-45f7-bd32-808da785f0fe","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"95dceb30-b160-4a70-8eeb-debf9aced5d0","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"photoUrls","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"dad7c418-52e8-4bd7-b5e9-497c93ee2d09","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tags","type":"array","typeValue":"Array<object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"66f62191-b9cd-43ed-93c6-5cb92681004c","parentUid":"191024ce-577c-4683-9cde-82dc3ac4228b","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"23f8e04f-889a-410a-94f0-662d459b727e","parentUid":"191024ce-577c-4683-9cde-82dc3ac4228b","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"191024ce-577c-4683-9cde-82dc3ac4228b","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"pet status in the store","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"dec271e6-2939-4b4c-97fd-bfaaca6a4df0","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/json","responses":[],"label":"Update an existing pet","url":"/pet","methodUrl":"/pet","_options":{"active":false}},{"uid":"002edbd6-2282-4cf2-8ce2-36bf88826566","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"get","methodName":"getFindByStatus","requests":[{"key":"status","label":"Status values that need to be considered for filter","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"d647b6c4-6611-48bc-b7bd-8093c18e08f4","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/x-www-form-urlencoded","responses":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"e70a364f-cd7b-446e-8c3a-2ebc85401060","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"category","type":"object","typeValue":"object","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"09bb9884-97a5-45dc-84a0-a1c7340c07ee","parentUid":"553340ac-9fb6-4369-8952-bfba1ea6dc49","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"13280397-0d45-459a-870b-96d26c4e3de8","parentUid":"553340ac-9fb6-4369-8952-bfba1ea6dc49","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"553340ac-9fb6-4369-8952-bfba1ea6dc49","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"6a0049c5-d979-4c1a-86c8-8977960f9024","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"photoUrls","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"7f72b39f-0dcb-4c4c-90dd-2222a9a971ea","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tags","type":"array","typeValue":"Array<object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"8fd611eb-6bbe-44fd-886c-6d105dcf440b","parentUid":"1e60ef30-fbfe-420f-a943-4fe30daa84f3","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"6970a88b-65e8-4f11-a3d5-a0a177b177e0","parentUid":"1e60ef30-fbfe-420f-a943-4fe30daa84f3","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"1e60ef30-fbfe-420f-a943-4fe30daa84f3","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"pet status in the store","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"fc83802e-0c23-4273-bf50-d52f304251de","parentUid":null,"_options":{"disableCheckbox":false}}],"label":"Finds Pets by status","url":"/pet/findByStatus","methodUrl":"/pet/findByStatus","_options":{"active":false}},{"uid":"78bb70a2-dd1f-4028-8c53-57ec8ac07309","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"get","methodName":"getFindByTags","requests":[{"key":"tags","label":"Tags to filter by","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"070a221f-8a8f-4ded-9400-399613408314","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/x-www-form-urlencoded","responses":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"593e6ed9-cad8-4fcd-ba0f-5ce4e47299a0","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"category","type":"object","typeValue":"object","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"eed24b8a-b46c-4f3a-9149-3a02b69b8976","parentUid":"2fbe983d-192c-4d4b-943f-db294efc248c","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"e0c9cfe4-3b26-4bfe-8b9f-93a3dc12f962","parentUid":"2fbe983d-192c-4d4b-943f-db294efc248c","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"2fbe983d-192c-4d4b-943f-db294efc248c","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"661aeb5e-3860-404d-9ee9-7c963dba876c","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"photoUrls","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"c6537925-1d18-4839-b48f-f210d8cb7a5b","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tags","type":"array","typeValue":"Array<object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"ded3c68b-812e-4481-8da6-600050226924","parentUid":"d0f43dc0-0b0f-4143-b584-f812a21922da","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"6bfc0be7-6073-4104-b1d4-849ef1dfa28c","parentUid":"d0f43dc0-0b0f-4143-b584-f812a21922da","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"d0f43dc0-0b0f-4143-b584-f812a21922da","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"pet status in the store","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"952adbba-62a5-4a40-927e-3b40da3da25f","parentUid":null,"_options":{"disableCheckbox":false}}],"label":"Finds Pets by tags","url":"/pet/findByTags","methodUrl":"/pet/findByTags","_options":{"active":false}},{"uid":"69d56d0d-ec78-4ae6-8602-4a7282919f2d","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"get","methodName":"getPet","requests":[{"key":"petId","label":"ID of pet to return","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"e86a5e38-09e3-4332-8006-f6e4867aef89","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/x-www-form-urlencoded","responses":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"0badb0e5-8353-42cb-83c0-a7c659d95b21","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"category","type":"object","typeValue":"object","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"21a8dc33-356a-4113-887c-8d1583ef5763","parentUid":"ec976058-15d0-464f-b337-b48470832941","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"87003369-d98c-4818-b2c9-db778dd98a4d","parentUid":"ec976058-15d0-464f-b337-b48470832941","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"ec976058-15d0-464f-b337-b48470832941","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"37ef24e4-ebca-4322-88a3-ce46536e4869","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"photoUrls","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":true,"example":"","defaultValue":"[]","uid":"68926312-3499-4210-878f-b8485ffd2f66","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tags","type":"array","typeValue":"Array<object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"e6fd249e-f3f9-44d1-a798-32dbc2cb4669","parentUid":"1b004469-d7d7-474f-8100-60d8509972b5","_options":{"disableCheckbox":false}},{"key":"name","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"48da82b9-36f2-4a02-b8a4-383c4b12ca15","parentUid":"1b004469-d7d7-474f-8100-60d8509972b5","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"1b004469-d7d7-474f-8100-60d8509972b5","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"pet status in the store","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"1ad461f6-0650-4b86-8c57-8860c5cdf3f4","parentUid":null,"_options":{"disableCheckbox":false}}],"label":"Find pet by ID","url":"/pet/{petId}","methodUrl":"/pet/${data.petId}","_options":{"active":false}},{"uid":"b7093652-6e7e-40c0-bf7c-03058944f62b","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"post","methodName":"postPet1","requests":[{"key":"petId","label":"ID of pet that needs to be updated","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"34fcb575-5472-4614-aecb-70778ff83c68","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"name","label":"Updated name of the pet","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"302a08a7-0734-433a-8469-cfd5bc362230","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"status","label":"Updated status of the pet","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"211d06cc-97aa-49ca-af35-8f5576ad5b26","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/x-www-form-urlencoded","responses":[],"label":"Updates a pet in the store with form data","url":"/pet/{petId}","methodUrl":"/pet/${data.petId}","_options":{"active":false}},{"uid":"bc5158e0-0fd8-412f-9fdc-e3628611db5d","parentUid":"f286b0f2-5eb9-40a6-b8d0-f3deaea64932","method":"delete","methodName":"deletePet","requests":[{"key":"api_key","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"d695f8a1-08d0-46bb-be89-ea9a8b2c3b1e","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"petId","label":"Pet id to delete","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"4fba4e53-ca3c-4180-be08-d8161daf2dea","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/json","responses":[],"label":"Deletes a pet","url":"/pet/{petId}","methodUrl":"/pet/${data.petId}","_options":{"active":false}}]);
