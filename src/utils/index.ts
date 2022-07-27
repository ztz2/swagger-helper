import { FieldInterface } from '@/core/types';

export const copyToClipboard = (text = '') => {
  // 创建元素用于复制
  const aux = document.createElement('input');
  aux.style.cssText =
    'position: fixed;z-index: -9999;left: -99999px;top: -99999px;';
  // 设置元素内容
  aux.setAttribute('value', text);
  // 将元素插入页面进行调用
  document.body.appendChild(aux);
  // 复制内容
  aux.select();
  // 将内容复制到剪贴板
  document.execCommand('copy');
  // 删除创建元素
  document.body.removeChild(aux);
};

export const checkType = (value: any, target: string) =>
  Object.prototype.toString.call(value) === `[object ${target}]`;

export const getInterfaceName = (value: string = '') => {
  const rex = /interface((.|\n)*?)\{/.exec(value);
  if (rex?.[1]) {
    return rex[1].replace(/(\s|\n)*/gim, '');
  }
  return '';
};

export const filterField = (fields: Array<FieldInterface> = [], pick = '') => {
  const picks: Array<string> = pick
    .replace('[', '')
    .replace(']', '')
    .split('.');
  let res = fields;
  while (picks.length) {
    const p = picks.shift();
    if ((<String>p).trim() === '') {
      continue;
    }
    const f = fields.find((item) => item.key === p);
    if (!f) {
      res = [];
    } else {
      res = f.children;
    }
  }
  return res;
};
