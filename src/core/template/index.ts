import { FieldInterface } from '@/core/types.ts';
import { merge } from 'lodash';

import artTemplate from 'art-template';

const template = artTemplate;

const mergeBlank = (value: any, num = 0) =>
  Array.from({ length: num })
    .map(() => value)
    .join('');

// @ts-ignore
if (window.template == null) {
  window.template = template;
}
template.defaults.escape = false;
template.defaults.minimize = false;
template.defaults.imports.generateEntityField = (
  field: FieldInterface,
  options: any,
  num: number,
) => {
  const gap = '  ';
  const tpl = `<% if (field.type==='array') { %>[<% } %>{
{{each field.children}}{{if $value.label || $value.typeValue}}${mergeBlank(
    gap,
    num + 1,
  )}// {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n{{/if}}${mergeBlank(
    gap,
    num + 1,
  )}{{$value.key}}: {{if $value.type === 'object' || $value.type === 'array'}}<%= $imports.generateEntityField($value, options, ${
    num + 1
  }) %>{{else if $value.type !== 'object' || $value.type !== 'array'}}{{$value.defaultValue}}{{else}}null{{/if}}{{if $index < field.children.length-1}},\n{{/if}}{{/each}}
${mergeBlank(gap, num)}}<% if (field.type==='array') { %>]<% } %>`;
  if (field.type === 'object' && field.children.length === 0) {
    return '{}';
  }
  if (
    field.type === 'array' &&
    (field.childType || field.children.length === 0)
  ) {
    return '[]';
  }
  return template.render(tpl, { field, options });
};

// 表格模板
export const generateTableTpl = (
  requests: Array<FieldInterface> = [],
  responses: Array<FieldInterface> = [],
  options?: { curd: boolean },
) => {
  // @ts-ignore
  options = merge(
    {
      crud: false,
      grid: false,
      maxlength: 100,
      placeholder: false,
      generateLabel: false,
    },
    options ?? {},
  );
  const tpl = `<template>
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
`;
  return template.render(tpl, { requests, responses, options });
};

// 实体类模板
export const generateEntityTpl = (
  requests: Array<FieldInterface> = [],
  options: { grid: boolean },
) => {
  // @ts-ignore
  options = merge(
    {
      grid: false,
      maxlength: 100,
      placeholder: false,
    },
    options ?? {},
  );
  const tpl = `<template>
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
`;
  const requiredFieldList = requests.filter((t) => t.required);
  return template.render(tpl, { requests, requiredFieldList, options });
};

// 实体类字段
export const generateEntityField = (
  fieldList: Array<FieldInterface>,
  options = {},
) => {
  const tpl = `<% if (fieldList.length > 0) { %>{
{{each fieldList}}{{if $value.label || $value.typeValue}}  // {{if $value.typeValue}}{ <%=$value.typeValue%> } {{/if}}{{if $value.label}}{{$value.label}}{{/if}}\n{{/if}}  {{$value.key}}: {{if $value.type === 'object' || $value.type === 'array'}}<%= $imports.generateEntityField($value, options, 1) %>{{else if $value.type !== 'object' || $value.type !== 'array'}}{{$value.defaultValue}}{{else}}null{{/if}}{{if $index < fieldList.length-1}},\n{{/if}}{{/each}}
}<% } %>`;
  return template.render(tpl, { fieldList, options });
};
