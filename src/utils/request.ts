import { extend } from 'umi-request';
import { message } from 'antd';

const request = extend({
  dataField: '',
  parseResponse: false,
});

request.interceptors.response.use(
  async (response: any) => {
    const body = await response.json();
    if (body?.code === 1000) {
      return body.data;
    }
    message.error(body.message);
    return Promise.reject(body.message);
  }, // @ts-ignore
  (error: any) => {
    const status = error?.response?.status;
    const text =
      error.response.message ??
      error.response.message ??
      error.response.statusText ??
      '出错了';
    if (status === 401) {
      message.error('没有权限访问该项目');
    } else {
      message.error(text);
    }
    return Promise.reject(error);
  },
);

export default request;
