import request from '@/utils/request';
import { aes } from '@/utils/crypto';
import { SECRET_KEY } from '@/constants';

export const getSwagger = (data: any) => {
  if (data.password) {
    data.password = aes.encrypt(data.password, SECRET_KEY);
  }
  return request('/app/swagger-helper/api/swagger-docs', {
    method: 'post',
    data,
  });
};
