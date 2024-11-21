// 일반 주문

import React, { useState } from "react";
import MarketOrder from "./priceType/MarketOrder";
import LimitOrder from "./priceType/LimitOrder";
import styles from "./StandardOrder.module.css";
import { IOrderProps } from "../../definitions";

const StandardOrder: React.FC<IOrderProps> = ({ initialMarketPrice, mode }) => {
  const TABS = [
    { label: "지정가 주문", component: <LimitOrder initialMarketPrice={initialMarketPrice} mode={mode} trackedPrice={0} /> },
    { label: "시장가 주문", component: <MarketOrder mode={mode} trackedPrice={0} /> },
  ];
  
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className={styles.container}>

      <div className={styles.subContainer}>
        <div className={styles.title}>주문 가격</div>
        {/* 네비게이션 바 */}
        <div className={styles.navbar}>
          {TABS.map((tab, index) => (
            <div
              key={index}
              className={`${styles.navItem} ${selectedTab === index ? styles.active : ""}`}
              onMouseDown={(event) => {
                event.stopPropagation(); // 클릭 시 드래그 방지
              }}
              onClick={() => {
                setSelectedTab(index);
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 탭의 컴포넌트 렌더링 */}
      <div>{TABS[selectedTab].component}</div>
    </div>
  );
};

export default StandardOrder
