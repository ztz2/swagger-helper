export const copyToClipboard = (text = '') => {
  // 创建元素用于复制
  const aux = document.createElement('input');
  aux.style.cssText = 'position: fixed;z-index: -9999;left: -99999px;top: -99999px;';
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

export const checkType = (value: any, target: string) => Object.prototype.toString.call(value) === `[object ${target}]`;
