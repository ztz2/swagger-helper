export default [
  { exact: false, path: '/', component: '@/layouts/root/index',
    routes: [
      { exact: true, path: '/', component: '@/pages/home/index' },
      { exact: true, path: '/home', redirect: '/' },

      { exact: true, path: '/detail/:uid', component: '@/pages/detail/index' },
    ],
  },
];
