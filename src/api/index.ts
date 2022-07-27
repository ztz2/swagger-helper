import request from '@/utils/request';
import { aes } from '@/utils/crypto';
import { SECRET_KEY } from '@/constants';

type Result<T> = {
  data: T;
  msg: string;
  code: number;
};

export const getSwagger = (data: any) => {
  if (data.password) {
    data.password = aes.encrypt(data.password, SECRET_KEY);
  }
  return request<Result<any>>('/app/swagger-helper/api/swagger-docs', {
    method: 'post',
    data,
  });
};
