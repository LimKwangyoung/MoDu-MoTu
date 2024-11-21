// 기업 정보, 뉴스, 공시

import { useState } from 'react';
import Overview from './Overview';
import News from './News';
import { IWidgetComponentProps } from '../../common/definitions';
import styles from './Info.module.css';

const TABS = [
  { label: '기업 정보', component: <Overview /> },
  { label: '뉴스', component: <News stockCode="" /> },
];

const Info = ({ setIsDraggable }: IWidgetComponentProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className="categoryTabs">
        {TABS.map((tab, index) => (
          <button
            key={index}
            className={`tabButton ${styles.tabButton}
              ${selectedTab === index ? 'activeTab' : ''}`}
            onMouseDown={(event) => {
              event.stopPropagation(); // 클릭 시 드래그 방지
              setIsDraggable(false); // 버튼 클릭 시 드래그 비활성화
            }}
            onClick={() => {
              setSelectedTab(index); // 선택된 탭의 인덱스를 업데이트
              setIsDraggable(true);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 선택된 탭의 컴포넌트 렌더링 */}
      <div className={`content ${styles.content}`}>{TABS[selectedTab].component}</div>
    </div>
  );
};

export default Info;
