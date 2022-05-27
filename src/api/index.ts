import request from '@/utils/request';
import { aes } from '@/utils/crypto';
import { SECRET_KEY } from '@/constants';

export const getSwagger = (data: any) => {
  if (data.password) {
    data.password = aes.encrypt(data.password, SECRET_KEY);
  }
  return request('/api/swagger-docs', {
    method: 'post',
    data
  });
};

export const importSwagger = (data: any) => {
  return request('/api/import-swagger', {
    method: 'post',
    data
  });
};
