import React, { FC, useState, useEffect, useRef } from 'react';
import { Empty, Tooltip, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ClipboardJS from 'clipboard';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import styles from './index.scss';

interface CodeBoxProps {
  code: string
  inCollapse?: boolean
}
const CodeBox: FC<CodeBoxProps> = ({code, inCollapse}) => {
  const copyBtnRef = useRef(null);
  const [clipboard, setClipboard] = useState<ClipboardJS|null>(null);

  useEffect(() => {
    return () => {
      clipboard?.destroy?.();
    };
  }, []);

  useEffect(() => {
    if (code){
      hljs.initHighlighting();
      if(copyBtnRef?.current) {
        const el = copyBtnRef.current;
        if (clipboard != null) {
          clipboard?.destroy?.();
        }
        const cp = new ClipboardJS(el, { text: () => code });
        cp.on('success', (e: Event) => {
          message.success('复制成功！');
        });
        setClipboard(cp);
      }
    }
  }, [code]);

  return(
    <div className={styles.codeBoxWrap}>
      {code
      ?<div className={styles.codeBoxContent}>
         <pre className={['hljs', inCollapse ? styles.codeBoxInCollapse : null].join(' ')}>
           <code className="language-js line-numbers">
             {code}
          </code>
         </pre>
          <div className={styles.codeBoxHandle}>
            <Tooltip title="复制代码">
              <CopyOutlined style={{fontSize: '26px'}} ref={copyBtnRef} />
            </Tooltip>
          </div>
      </div>
      :<div><Empty description="暂无数据" /></div>
      }
    </div>
  )
}
export default CodeBox;
