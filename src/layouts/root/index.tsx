import { useEffect } from 'react';
import { Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { connect, getDvaApp, IRouteComponentProps } from 'umi';
import { PersistGate } from 'redux-persist/integration/react';
import styles from './index.scss';
import Report from '@/components/report';

function Layout({
  children,
  location,
  route,
  history,
  match,
  dispatch,
}: IRouteComponentProps) {
  const app = getDvaApp();
  const persistor = app._store.persist;

  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: 'tpl/checkUpdate' });
    }, 250);
  }, []);

  return (
    // @ts-ignore
    <PersistGate loading={null} persistor={persistor}>
      <div className={styles.appHeader}>
        <div className={styles.appHeader__l}>
          <a href="/" className={styles.appLog}>
            SWAGGER HELPER
          </a>
        </div>
        <div className={styles.appHeader__r}>
          <Space size={20}>
            <a href="https://ztz-table.andou.live:9527" target="_blank">
              ZTZ TABLE 组件
            </a>
            {/*<a href="https://github.com/ztz2/ztz-table" target="_blank">*/}
            {/*    <GithubOutlined style={{'font-size': '28px', 'color': '#333333'}} />*/}
            {/*</a>*/}
          </Space>
        </div>
      </div>
      <div className={styles.container}>{children}</div>
      <Report />
    </PersistGate>
  );
}

export default connect()(Layout);
