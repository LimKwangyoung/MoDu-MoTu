// 주문하기 - 구매

import React, { useState } from "react";
import StandardOrder from "./orderType/StandardOrder";
import ScheduledOrder from "./orderType/ScheduledOrder";
import styles from "./Buy.module.css";
import { IPriceProps } from "../definitions";

const Buy: React.FC<IPriceProps> = ({ initialMarketPrice }) => {
  const TABS = [
    { label: "일반 주문", component: <StandardOrder initialMarketPrice={initialMarketPrice} mode={"BUY"} /> },
    { label: "조건 주문", component: <ScheduledOrder initialMarketPrice={initialMarketPrice} mode={"BUY"} /> },
  ];

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className={styles.container}>

      <div className={styles.subContainer}>
        <div className={styles.title}>주문 유형</div>
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

export default Buy;
