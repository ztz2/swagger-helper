import React, { FC, useState } from 'react';
import { IndexModelState, ConnectProps, Loading, connect, Link } from 'umi';
import {
  notification,
  Alert,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Button,
  message,
  Popconfirm,
} from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { merge, pick } from 'lodash';
import { Project } from '@/core/types';
import { swaggerParser } from '@/core';

interface HomePageProps extends ConnectProps {
  swagger: IndexModelState;
}
const HomePage: FC<HomePageProps> = ({ swagger, dispatch }) => {
  const [addFormRef] = Form.useForm();
  const [visibleAdd, setVisibleAdd] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [columns] = useState([
    {
      title: '项目名称',
      dataIndex: 'label',
      render: (text: string, row: any) => (
        <Link to={`/detail/${row.uid}`}>{text}</Link>
      ),
    },
    {
      title: 'Swagger配置地址',
      dataIndex: 'url',
    },
    {
      title: '操作',
      width: '80px',
      render: (row: any) => (
        <Space size="middle">
          <Popconfirm
            title="确认要删除吗?"
            onConfirm={() => {
              dispatch?.({ type: 'swagger/delete', payload: row });
              message.success('删除成功');
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]);

  // 添加模态框，点击确定按钮
  const handleSubmit = () => {
    addFormRef
      .validateFields()
      .then(async (values) => {
        setLoadingAdd(true);
        const list = await swaggerParser(values);
        if (list.length === 0) {
          return message.error(
            '没有获取到配置文件，请检查Swagger文档地址是否正确？',
          );
        }
        const successText = [];
        for (const data of list) {
          successText.push(data.label);
          dispatch?.({
            type: 'swagger/add',
            payload: merge(new Project(), values, pick(data, ['label', 'url'])),
          });
        }
        notification.open({
          message: '添加成功',
          description: (
            <div>
              <div>已获取到的项目配置：</div>
              {successText.map((msg) => (
                <div>{msg}</div>
              ))}{' '}
            </div>
          ),
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        });
        addFormRef.resetFields();
        setLoadingAdd(false);
        setVisibleAdd(false);
      })
      .catch(() => {
        setLoadingAdd(false);
      });
  };

  const handleDeleteAll = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要全部删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        dispatch?.({ type: 'swagger/deleteAll' });
        message.success('全部删除成功');
      },
    });
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ marginBottom: '10px' }}>
          <Space>
            <Button type="primary" onClick={() => setVisibleAdd(true)}>
              添加
            </Button>
            {/*<Button type="primary">导入内部接口数据</Button>*/}
            <Button
              type="primary"
              disabled={swagger.list.length === 0}
              onClick={() => handleDeleteAll()}
              danger
            >
              全部删除
            </Button>
            <Alert
              style={{ marginLeft: 20 }}
              message="支持对Swagger Petstore - OpenAPI 2.0 以及 3.0 版本的模板生成"
              type="info"
              closable
            />
          </Space>
        </div>

        <Table columns={columns} dataSource={swagger.list} />

        {/*添加功能模态框 -- 开始*/}
        <Modal
          title="添加"
          okText="确定"
          cancelText="取消"
          visible={visibleAdd}
          onOk={handleSubmit}
          confirmLoading={loadingAdd}
          onCancel={() => setVisibleAdd(false)}
        >
          <Form
            name="basic"
            form={addFormRef}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
          >
            <Form.Item label="项目名称" name="label" initialValue="">
              <Input />
            </Form.Item>

            <Form.Item
              label="Swagger文档地址"
              tooltip={
                <>
                  <div className="word-break-all">
                    <div>方式一：输入Swagger文档URL地址即可</div>
                    <div style={{ marginTop: 10 }}>
                      方式二：浏览器访问Swagger文档，按F12打开控制台-&gt;网络，查看AJAX请求，找到请求路径以
                      api-docs
                      为后缀的请求，它就是Swagger配置文件资源访问请求，复制改地址到这里即可。Swagger配置文件请求例子：https://domain.com/project/v2/api-docs
                    </div>
                    <div style={{ marginTop: 10 }}>
                      注意：如果Swagger文档在局域网(本地)，请配置内网穿透，或者部署到公网服务器，之后在进行添加操作。
                    </div>
                  </div>
                </>
              }
              name="url"
              initialValue=""
              rules={[{ required: true, message: '必填项!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="用户名" name="username" initialValue="">
              <Input />
            </Form.Item>

            <Form.Item label="密码" name="password" initialValue="">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        {/*添加功能模态框 -- 结束*/}
      </div>
    </div>
  );
};

export default connect((state: IndexModelState) => ({
  swagger: state.swagger,
}))(HomePage);
