import { getDvaApp } from 'umi';
import { PersistGate } from 'redux-persist/integration/react';
import { IRouteComponentProps } from 'umi';
import styles from './index.scss'

export default function Layout({ children, location, route, history, match }: IRouteComponentProps) {
  const app = getDvaApp();
  const persistor = app._store.persist;

  return ( // @ts-ignore
    <PersistGate loading={null} persistor={persistor}>
      <div className={styles.container}>
        {children}
      </div>
    </PersistGate>
  )
}
