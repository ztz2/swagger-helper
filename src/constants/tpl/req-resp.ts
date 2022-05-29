import { cloneDeep } from 'lodash';

const COMMON_HEAD = `

/**
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
  // 是否生成CURD功能
  crud: boolean
  // 是否使用格栅布局
  grid: boolean
  // 输入框的 maxlength 属性
  maxlength: number
  // 是否生成输入框的 placeholder 属性
  placeholder: boolean
  // 表单是否生成label
  generateLabel: boolean
}
 * @param requests { Array<FieldInterface> } 请求数据字段集合
 * @param responses { Array<FieldInterface> } 响应数据字段集合
 * @param options { Options } 可选的配置项
 * @return [] { Array<string> } 返回数组，里面每一项字符串都是一个模板
 */
function renderTpl (requests, responses, options) {
   // 模板引擎基于 art-template 使用，template 变量就是对art-template的引用，更多语法方法参考官方文档：https://github.com/aui/art-template
  // 函数中可以使用Lodash工具包所有功能，比如 cloneDeep，使用方式：lodash.cloneDeep
  const result = [];
  options = lodash.merge({
    crud: false,
    grid: false,
    maxlength: 100,
    placeholder: false,
    generateLabel: false
  }, lodash.isPlainObject(options) ? options : {});
`;

/**------------------------------  Vue-表格模板--开始  ------------------------------**/
export const REQ_RESP_TPL2000 =
COMMON_HEAD + `
  const tpl = \`<template>
  <div class="app-container">
    <NrTable
      {{if options.crud}}:crud="crud"
      {{/if}}:columns="columns"
      :data="getTableData"
      :query-params="queryParams"{{if options.crud}}
      :entity-component-props="entityComponentProps"{{/if}}
      :table-row-options="tableRowOptions"
      ref="nrTable"
    >
      <!-- 顶部自定义操作配置 -->
      <template #action>
        <nr-button size="medium" type="info">顶部自定义按钮1</nr-button>
        <nr-button size="medium" type="info">顶部自定义按钮2</nr-button>
      </template>{{if requests.length > 0}}
      <!-- 搜索配置 -->
      <template #query>{{if options.grid}}
        <el-row :gutter="30">{{/if}}{{if requests[0]}}
        {{if options.grid}}  <el-col :span="span">\n            {{/if}}<el-form-item{{if options.generateLabel}} label="{{if requests[0].label}}{{requests[0].label}}{{else}}{{requests[0].key}}{{/if}}"{{/if}} prop="{{requests[0].key}}">
          {{if options.grid}}    {{/if}}<NrSelect v-model="queryParams.{{requests[0].key}}" :options="options.{{requests[0].key}}"{{if options.placeholder}} placeholder="请选择{{if requests[0].label}}{{requests[0].label}}{{/if}}"{{/if}} />
        {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n          </el-col>{{/if}}{{/if}}{{each requests.slice(1)}}{{if options.grid}}\n          <el-col :span="span">\n    {{else}}\n{{/if}}        <el-form-item{{if options.generateLabel}} label="{{if $value.label}}{{$value.label}}{{else}}{{$value.key}}{{/if}}"{{/if}} prop="{{$value.key}}">
          {{if options.grid}}    {{/if}}<el-input v-model="queryParams.{{$value.key}}"{{if options.placeholder}} placeholder="请输入{{if $value.label}}{{$value.label}}{{/if}}"{{/if}}{{if options.maxlength}} maxlength="{{options.maxlength}}"{{/if}} clearable />
        {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n          </el-col>{{/if}}{{/each}}{{if options.grid}}\n        </el-row>{{/if}}
      </template>{{/if}}
    </NrTable>
  </div>
</template>

<script>
import {
  {{if options.crud}}add as add,
  del as del,
  edit as edit,
  detail as detail,
  {{/if}}query as query,
} from '@/api/system/user'{{if options.crud}}\nimport Entity from './components/entity'{{/if}}

export default {
  name: 'NrTable{{if options.crud}}Crud{{/if}}Example',
  data() {
    return {<% if (options.grid) { %>
      span: 8,<% } %>
      queryParams: {{if requests.length === 0}}{},{{else}}{
        {{each requests}}{{if $value.label || $value.typeValue}}// {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n        {{/if}}{{$value.key}}: {{$value.defaultValue}}{{if $index !== requests.length - 1}},\n        {{/if}}{{/each}}
      },{{/if}}
      options: {{if requests.length === 0}}{},{{else}}{<% if (requests[0].label) { %>\n        // {{requests[0].label}}<% } %>
        {{requests[0].key}}: [{ name: '测试选项1', value: '100' }]
      },{{/if}}
      tableRowOptions: {},{{if options.crud}}
      crud: {
        // 增
        add: {
          // 【必须】{ api(params): Promise } 请求接口API
          api: add,
          // 【必须】实体类组件
          entityComponent: Entity,
          // 【可选】{ string|null } 操作成功提示消息，为null，则不提示
          successMsg: '添加成功'
        },
        // 改
        edit: {
          // 【必须】{ api(params): Promise } 请求接口API
          api: edit,
          // 【可选】{ detailApi(params): Promise } 请求详情接口API
          detailApi: detail,
          // 【必须】实体类组件
          entityComponent: Entity,
        },
        // 删
        del: {
          // 【必须】{ api(params): Promise } 请求接口API
          api: del
        }
      },{{/if}}
      columns: [
        { type: 'selection' },{{each responses}}
        { label: '{{if $value.label}}{{$value.label}}{{else}}{{$value.key}}{{/if}}', prop: '{{$value.key}}' },{{/each}}
        {
          label: '操作',
          width: '210',
          render: (h, { row }) => {
            return (<el-button type='text' class='padding--empty'>自定义操作</el-button>)
          }
        }
      ]
    }
  },{{if options.crud}}
  computed: {
    entityComponentProps() {
      const { options } = this
      return { options }
    }
  },{{/if}}
  methods: {
    getTableData: query
  }
}
</script>
\`;

  result.push(template.render(tpl, { requests, responses, options }));

  return result;
};
`;
/**------------------------------  Vue-表格模板--开始  ------------------------------**/

/**------------------------------  Vue-表格模板[element-ui表格]--开始  ------------------------------**/
export const REQ_RESP_TPL2001 =
  COMMON_HEAD + `
  const tpl =
\` <template>
    <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>{{each responses}}
      <el-table-column
        prop="{{$value.key}}"
        label="{{$value.label}}"
        width="180">
      </el-table-column>{{/each}}
    </el-table>
  </template>

  <script>
    export default {
      data() {
        return {
          tableData: [{
            {{each responses}}{{if $index > 0}}            {{/if}}{{$value.key}}: '模拟数据：{{$index}}'{{if $index < responses.length - 1}},\n{{/if}}{{/each}}
          }]
        }
      }
    }
  </script>
\`;
  const requiredFieldList = requests.filter((t) => t.required);

  result.push(template.render(tpl, { responses, requiredFieldList, options }))

  return result;
};
`;
/**------------------------------  Vue-表格模板[element-ui表格]--结束  ------------------------------**/

/**------------------------------  Vue-实体类模板--开始  ------------------------------**/
export const REQ_RESP_TPL2100 =
COMMON_HEAD + `
  const tpl = \`<template>
  <el-form
    :rules="rules"
    :model="entity"
    :disabled="currentDisabled"
    :class="{'crud-entity--detail': actionType === 'DETAIL'}"
    @submit.native.prevent
    ref="form"
    label-width="80px"
    class="crud-entity"
  >{{if requests.length > 0}}{{if options.grid}}\n    <el-row :gutter="30">{{/if}}{{if requests[0]}}
    {{if options.grid}}  <el-col :span="span">\n        {{/if}}<el-form-item label="{{if requests[0].label}}{{requests[0].label}}{{else}}{{requests[0].key}}{{/if}}" prop="{{requests[0].key}}">
      {{if options.grid}}    {{/if}}<NrSelect v-model="entity.{{requests[0].key}}" :options="options.{{requests[0].key}}"{{if options.placeholder}} placeholder="请选择{{if requests[0].label}}{{requests[0].label}}{{/if}}"{{/if}} />
    {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n      </el-col>{{/if}}{{/if}}{{each requests.slice(1)}}{{if options.grid}}\n      <el-col :span="span">\n        {{else}}\n    {{/if}}<el-form-item label="{{if $value.label}}{{$value.label}}{{else}}{{$value.key}}{{/if}}" prop="{{$value.key}}">
      {{if options.grid}}    {{/if}}<el-input v-model="entity.{{$value.key}}"{{if options.placeholder}} placeholder="请输入{{if $value.label}}{{$value.label}}{{/if}}"{{/if}}{{if options.maxlength}} maxlength="{{options.maxlength}}"{{/if}} clearable />
    {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n      </el-col>{{/if}}{{/each}}{{if options.grid}}\n    </el-row>{{/if}}
  {{/if}}{{if requests.length === 0}}\n    <!-- 没有可以生成的字段 -->\n  {{/if}}</el-form>
</template>

<script>
import crudEntityMixin from '@/mixins/crud-entity'

export default {
  emits: [],
  mixins: [crudEntityMixin],
  data() {
    return {<% if (options.grid) { %>
      span: 8,<% } %>
      loadingOptions: false,
      entity: {{if requests.length === 0}}{},{{else}}{
        {{each requests}}{{if $value.label || $value.typeValue}}// {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n        {{/if}}{{$value.key}}: {{$value.defaultValue}}{{if $index !== requests.length - 1}},\n        {{/if}}{{/each}}
      },{{/if}}
      // 在CRUD中传值的对象
      entityComponentProps: {},
      options: {{if requests.length === 0}}{},{{else}}{<% if (requests[0].label) { %>\n        // {{requests[0].label}}<% } %>
        {{requests[0].key}}: [{ name: '测试选项1', value: '100' }]
      },{{/if}}
      rules: {{if requiredFieldList.length === 0}}{},{{else}}{
        {{requiredFieldList[0].key}}: [{{if requests[0].label}} // {{requests[0].label}}{{/if}}
          { required: true, message: '必选项', trigger: 'change' }
        ],{{each requiredFieldList.slice(1)}}\n        {{$value.key}}: [{{if $value.label}} // {{$value.label}}{{/if}}
          { required: true, message: '必填项', trigger: 'blur' }
        ]{{if $index < requiredFieldList.length - 2}},{{/if}}{{/each}}
      },{{/if}}
    }
  },
  computed: {
    currentDisabled() {
      return this.disabled || this.actionType === 'DETAIL'
    }
  },
  created() {
    this.init()
  },
  methods: {
    // 【可选】初始化操作（比如：获取Select的option数据源、字典数据等）
    init() {
      this.loadingOptions = true
      Promise.all([
        // 请求接口调用列表
      ]).finally(() => {
        this.loadingOptions = false
      })
    },
     // 初始化或者重置一些字段，crud-mixin不会调用该函数
    initFields() {},
    // 【可选】表单校验前回调函数（可以在该回调中处理一些特殊字段），在此处也可以自定义校验一些字段，校验失败时，直接抛出异常，终止后续操作
    onBeforeValidate(entity, options = {}) {
      // 处理一下特殊的数据格式
      return entity
    },
    // 【可选】Prop实体类对象[$props.data字段]从外部中传递进来进而实体类数据发生变化后的回调函数（可以在这里处理一些特殊字段）
    onEntityPropAfterUpdate(entity, options = {}) {
      // 一些特殊字段，特殊处理
      return entity
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
\`;
  const requiredFieldList = requests.filter((t) => t.required);

  result.push(template.render(tpl, { requests, requiredFieldList, options }))

  return result;
};
`;
/**------------------------------  Vue-实体类模板--结束  ------------------------------**/

/**------------------------------  Vue-实体类模板[element-ui表单]--开始  ------------------------------**/
export const REQ_RESP_TPL2101 =
  COMMON_HEAD + `
  const tpl =
\`<el-form ref="form" :model="form" label-width="80px">{{if requests.length > 0}}{{if options.grid}}\n    <el-row :gutter="30">{{/if}}{{if requests[0]}}
    {{if options.grid}}  <el-col :span="span">\n        {{/if}}<el-form-item label="{{if requests[0].label}}{{requests[0].label}}{{else}}{{requests[0].key}}{{/if}}" prop="{{requests[0].key}}">
      {{if options.grid}}    {{/if}}<el-input v-model="entity.{{requests[0].key}}" {{if options.placeholder}} placeholder="请输入{{if requests[0].label}}{{requests[0].label}}{{/if}}"{{/if}} />
    {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n      </el-col>{{/if}}{{/if}}{{each requests.slice(1)}}{{if options.grid}}\n      <el-col :span="span">\n        {{else}}\n    {{/if}}<el-form-item label="{{if $value.label}}{{$value.label}}{{else}}{{$value.key}}{{/if}}" prop="{{$value.key}}">
      {{if options.grid}}    {{/if}}<el-input v-model="entity.{{$value.key}}"{{if options.placeholder}} placeholder="请输入{{if $value.label}}{{$value.label}}{{/if}}"{{/if}}{{if options.maxlength}} maxlength="{{options.maxlength}}"{{/if}} clearable />
    {{if options.grid}}    {{/if}}</el-form-item>{{if options.grid}}\n      </el-col>{{/if}}{{/each}}{{if options.grid}}\n    </el-row>{{/if}}
{{/if}}{{if requests.length === 0}}\n    <!-- 没有可以生成的字段 -->\n  {{/if}}</el-form>
<script>
  export default {
    data() {
      return {
        form: {{if requests.length === 0}}{},{{else}}{
            {{each requests}}{{if $value.label || $value.typeValue}}{{if $index > 0}}   {{/if}}// {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n           {{/if}}{{$value.key}}: {{$value.defaultValue}}{{if $index !== requests.length - 1}},\n        {{/if}}{{/each}}
        },{{/if}}
      }
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>
\`;
  const requiredFieldList = requests.filter((t) => t.required);

  result.push(template.render(tpl, { requests, requiredFieldList, options }))

  return result;
};
`;
/**------------------------------  Vue-实体类模板[element-ui表单]--结束  ------------------------------**/

/**------------------------------  请求参数&响应参数--开始  ------------------------------**/
export const REQ_RESP_TPL6000 =
  COMMON_HEAD + `
function renderFields (fieldList, options) {
    if (fieldList.length === 0) {
      return '';
    }
    const tpl = \`<% if (fieldList.length > 0) { %>{
{{each fieldList}}{{if $value.label || $value.typeValue}}  // {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n{{/if}}  {{$value.key}}: {{if $value.type === 'object' || $value.type === 'array'}}<%= $imports.generateEntityField($value, options, 1) %>{{else if $value.type !== 'object' || $value.type !== 'array'}}{{$value.defaultValue}}{{else}}null{{/if}}{{if $index < fieldList.length-1}},\n{{/if}}{{/each}}
}<% } %>\`;
    return template.render(tpl, { fieldList, options });
  }

  template.defaults.imports.generateEntityField = function (field, options, num) {
    const gap = '  ';
    const mergeBlank = function (value, num = 0) { return Array.from({ length: num }).map(() => value).join(''); };
    const tpl = \`<% if (field.type==='array') { %>[<% } %>{
{{each field.children}}{{if $value.label || $value.typeValue}}\${mergeBlank(gap, num + 1)}// {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n{{/if}}\${mergeBlank(gap, num + 1)}{{$value.key}}: {{if $value.type === 'object' || $value.type === 'array'}}<%= $imports.generateEntityField($value, options, \${num + 1}) %>{{else if $value.type !== 'object' || $value.type !== 'array'}}{{$value.defaultValue}}{{else}}null{{/if}}{{if $index < field.children.length-1}},\n{{/if}}{{/each}}
\${mergeBlank(gap, num)}}<% if (field.type==='array') { %>]<% } %>\`;
    if (field.type === 'object' && field.children.length === 0) {
      return '{}';
    }
    if (field.type === 'array' && (field.childType || field.children.length === 0)) {
      return '[]';
    }
    return template.render(tpl, { field, options });
  };


  // 请求数据生成
  result.push(renderFields(requests, options));

  // 响应数据生成
  result.push(renderFields(responses, options));

  return result;
};
`;
/**------------------------------  请求参数&响应参数--结束  ------------------------------**/

export const REQ_RESP_TPL_DEMO1 = COMMON_HEAD + `
  const tpl1 =
\`生成模板例子，这里获取请求数据和响应数据的字段，根据这些字段，可以生成想要的任何模板代码

{{if requests.length > 0}}
请求数据字段：{{each requests}}
   {{$value.key}}({{$value.label}}){{/each}}
{{/if}}
{{if responses.length > 0}}
响应数据字段：{{each responses}}
   {{$value.key}}({{$value.label}}){{/each}}
{{/if}}
\`;
  // 当一个模板定义好之后，使用 template.render 方法进行生成，并添加到result返回数组中
  // 当然可以生成多个模板，每次生成好之后，添加到result数组中即可
  result.push(template.render(tpl1, { requests, responses, options }));

  // 返回生成好的模板
  return result;
};
`;

export const getMockApiData: any = () => cloneDeep({"uid":"be235f91-eec1-42fb-9df0-d1871e88b906","parentUid":"8f0f42e5-ac1b-489f-b33c-6f225e42bfab","method":"post","methodName":"postSubmit","requests":[{"key":"submitToken","label":"登录确认令牌","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"b1cceea0-e91c-491e-84d5-6543f504800d","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"tenantId","label":"登录机构ID","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"3fc8adef-a08a-4d61-85c2-f6f95d481cb7","parentUid":null,"_options":{"disableCheckbox":false}}],"requestContentType":"application/json","responses":[{"key":"code","label":"状态码","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"d9d1565d-d9c6-47c2-9f02-3b4d43eb3512","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"data","label":"业务数据","type":"object","typeValue":"Object","children":[{"key":"accessToken","label":"授权令牌","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"65d45dbd-c79c-4439-8a1d-53fff2a1923c","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"currentTenant","label":"当前登录机构ID","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"88a3544f-a9f3-4717-a4fe-cb262ba314bb","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"nickName","label":"账户昵称","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"adf3c645-35c9-40fe-8e98-a073239b4f8f","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"permissions","label":"权限集合,登录成功返回","type":"array","typeValue":"Array<string>","children":[],"childType":"string","description":"","required":false,"example":"","defaultValue":"[]","uid":"d597856b-b450-45b0-a515-e5845b9b26a9","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"submitToken","label":"登录确认令牌，若存在多机构不直接返回accessToken，通过SubmitToken确认登录机构","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"94da4b98-0107-49b8-8184-e5eb2d7f93eb","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"tenants","label":"账户关联机构","type":"array","typeValue":"Array<Object>","children":[{"key":"id","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"2cc2d669-51a5-4794-8826-b3f7e4351499","parentUid":"41d61152-85e6-40d5-b0c1-b991b9270fc6","_options":{"disableCheckbox":false}},{"key":"lastLoginTime","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"0099ed3d-bf58-48cf-a386-55f7fdc2c9ea","parentUid":"41d61152-85e6-40d5-b0c1-b991b9270fc6","_options":{"disableCheckbox":false}},{"key":"tenantCode","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"f532552a-489c-4350-806e-a8c3113b18e6","parentUid":"41d61152-85e6-40d5-b0c1-b991b9270fc6","_options":{"disableCheckbox":false}},{"key":"tenantName","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"e8fbb381-baca-4fb0-aa8e-bf7013b43ce2","parentUid":"41d61152-85e6-40d5-b0c1-b991b9270fc6","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"[]","uid":"41d61152-85e6-40d5-b0c1-b991b9270fc6","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"type","label":"登录类型，1：账号密码，2：短信验证码","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":1,"uid":"b27d11bd-036a-4694-b7f2-cefc6b2f7a00","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"userId","label":"账户ID","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":null,"uid":"0f0ad715-6c62-4b7f-9616-ac61025adddb","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"userType","label":"账户类型，0：管理用户，1：机构用户","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":0,"uid":"0128697d-094c-42b5-a79c-8955eeb3b461","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}},{"key":"username","label":"账户名","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":"''","uid":"2dfdbbcb-9083-496d-b580-5d377e5bc28d","parentUid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","_options":{"disableCheckbox":false}}],"childType":"","description":"","required":false,"example":"","defaultValue":"{}","uid":"532dc114-d431-4dca-aa1e-9f686ef97b1f","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"msg","label":"消息内容","type":"string","typeValue":"string","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":"''","uid":"1c6f0459-460e-47bf-aa68-1c90a5014e93","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"success","type":"boolean","typeValue":"boolean","children":[],"childType":"","description":"","required":false,"example":"","defaultValue":false,"uid":"ff0494ec-8c8a-49ba-96ea-54e4cb042b23","parentUid":null,"_options":{"disableCheckbox":false}},{"key":"time","label":"时间戳","type":"number","typeValue":"number","children":[],"childType":"","description":"","required":true,"example":"","defaultValue":null,"uid":"170d1998-722c-4ccf-8680-3c9721709fcf","parentUid":null,"_options":{"disableCheckbox":false}}],"label":"登录确认","url":"/token/tenant/submit","methodUrl":"/token/tenant/submit","_options":{"active":false}});
