// 运行时配置
// 运行时候、配置的区别是跑在浏览器上，可以写函数，jsx,import浏览器依赖
import { message } from 'antd';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// redux-persist 的配置
const persistConfig = {
  key: 'root',
  storage,
};
const persistEnhancer = () => (createStore: any) => (reducer: any, initialState: any, enhancer: any) => {
  const store = createStore(persistReducer(persistConfig, reducer), initialState, enhancer);
  const persist = persistStore(store);
  return { ...store, persist };
};
export const dva = {
  config: {
    onError(e: Error) {
      message.error(e.message, 3);
    },
    extraEnhancers: [persistEnhancer()],
  },
};
