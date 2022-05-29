import { defineConfig } from 'umi';
const { NODE_ENV } = process.env;
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
  chainWebpack(config, { env, webpack, createCSSRule }) {
    if (NODE_ENV === 'production'){
      // config.merge({
      //   optimization: {
      //     splitChunks: {
      //       chunks: 'all',
      //       automaticNameDelimiter: '.',
      //       name: true,
      //       minSize: 30000,
      //       minChunks: 1,
      //       cacheGroups: {
      //         vendors: {
      //           name: 'vendors',
      //           chunks: 'all',
      //           test: /[\\/]node_modules[\\/]/,
      //           priority: -12,
      //         },
      //       },
      //     },
      //   },
      // });
    }
  },
});
