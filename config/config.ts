import { defineConfig } from 'umi';
import routes from './routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes,
  fastRefresh: {},
  sass: {},
  proxy: {
    '/api': {
      target: 'https://swaggerhelper.andou.live:9527',
      // target: 'http://127.0.0.1:9528',
      // changeOrigin: true,
      // pathRewrite: {
      //   '^/api': ''
      // }
    },
  },
});
