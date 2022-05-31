import { defineConfig } from 'umi';
const { NODE_ENV } = process.env;
import routes from './routes';

const isProduction = NODE_ENV === 'production';

export default defineConfig({
  title: 'Swagger Helper',
  nodeModulesTransform: {
    type: 'none',
  },
  routes,
  fastRefresh: {},
  externals: {
    lodash: '_',
    'highlight.js': 'hljs',
    'crypto-js': 'CryptoJS',
    clipboard: 'ClipboardJS',
    'art-template': 'template',

    moment: 'moment',
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
  },
  links: [
    {
      rel: 'stylesheet',
      href: 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/antd/4.18.9/antd.min.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/11.4.0/styles/vs2015.min.css',
    },
  ],
  scripts: [
    {
      src: 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/lodash.js/4.17.21/lodash.min.js',
    },
    {
      src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/art-template/4.13.2/lib/template-web.min.js',
    },
    {
      src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/highlight.js/11.4.0/highlight.min.js',
    },
    {
      src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/crypto-js/4.1.1/crypto-js.min.js',
    },
    {
      src: 'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/clipboard.js/2.0.10/clipboard.min.js',
    },
    {
      src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/moment.js/2.29.1/moment.min.js',
    },
    isProduction
      ? {
          src: 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/react/17.0.2/umd/react.production.min.js',
        }
      : {
          src: 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/react/17.0.2/umd/react.development.min.js',
        },
    isProduction
      ? {
          src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/react-dom/17.0.2/umd/react-dom.production.min.js',
        }
      : {
          src: 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/react-dom/17.0.2/umd/react-dom.development.min.js',
        },
    {
      src: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/antd/4.18.9/antd.min.js',
    },
  ],

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
    if (isProduction) {
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
