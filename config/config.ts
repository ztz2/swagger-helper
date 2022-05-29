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
      config.merge({
        optimization: {
          splitChunks: {
            chunks: 'all',
            minSize: 10000,
            minChunks: 2,
            maxAsyncRequests: 10,
            maxInitialRequests: 5,
            automaticNameDelimiter: '.',
            cacheGroups: {
              vendor: {
                name: 'vendors',
                test({ resource }) {
                  return /[\\/]node_modules[\\/]/.test(resource);
                },
                priority: 10,
              },
              antdesigns: {
                name: 'antdesigns',
                test({ resource }) {
                  return /[\\/]node_modules[\\/](@ant-design|antd|@antd)[\\/]/.test(resource);
                },
                priority: 40,
                enforce: true,
              },
              image: {
                name: 'images',
                test({ resource }) {
                  return /png/.test(resource);
                },
                priority: 50,
              },
              pages: {
                name: 'pages',
                test({ resource }) {
                  return /[\\/]src[\\/]/.test(resource);
                },
                priority: 60,
              },
              topology: {
                name: 'topology',
                test({ resource }) {
                  return /[\\/]node_modules[\\/](@topology)[\\/]/.test(resource);
                },
                priority: 70,
              },
              Control: {
                name: 'Control',
                test({ resource }) {
                  return /[\\/]src[\\/]pages[\\/]Control[\\/]/.test(resource);
                },
                priority: 80,
              },
            },
          },
        },
      });
    }
  },
});
