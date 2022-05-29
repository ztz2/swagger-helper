import { useEffect } from 'react';
import { getDvaApp, connect } from 'umi';
import { PersistGate } from 'redux-persist/integration/react';
import { IRouteComponentProps } from 'umi';
import styles from './index.scss'
import Report from '@/components/report';

function Layout({ children, location, route, history, match, dispatch }: IRouteComponentProps) {
  const app = getDvaApp();
  const persistor = app._store.persist;

  useEffect(() => { dispatch({ type: 'tpl/checkUpdate' }) }, [])

  return ( // @ts-ignore
    <PersistGate loading={null} persistor={persistor}>
      <div className={styles.container}>
        {children}
      </div>
      <Report />
    </PersistGate>
  )
}

export default connect()(Layout);
