// 주문하기(구매, 판매, 대기), 주문내역

import { useState } from "react";
import Order from "./Order";
import OrderList from "./OrderList";
import { IWidgetComponentProps } from "../../common/definitions";
import styles from './Trading.module.css';

const TABS = [
  { label: "주문하기", component: <Order /> },
  { label: "주문내역", component: <OrderList /> },
];

const Trading = ({ setIsDraggable }: IWidgetComponentProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className="categoryTabs">
        {TABS.map((tab, index) => (
          <button
            key={index}
            className={`tabButton ${styles.tabButton}
              ${selectedTab === index ? "activeTab" : ""}`}
            onMouseDown={(event) => {
              event.stopPropagation(); // 클릭 시 드래그 방지
              setIsDraggable(false); // 버튼 클릭 시 드래그 비활성화
            }}
            onClick={() => {
              setSelectedTab(index);
              setIsDraggable(true); // 클릭 후 드래그 다시 활성화
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 선택된 탭의 컴포넌트 렌더링 */}
      <div className={`content ${styles.content}`}>
        {TABS[selectedTab].component}
      </div>
    </div>
  );
};

export default Trading;
