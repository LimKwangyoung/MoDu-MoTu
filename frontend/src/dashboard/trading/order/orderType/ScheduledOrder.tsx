// 조건 주문

import React, { useState } from "react";
import MarketOrder from "./priceType/MarketOrder";
import LimitOrder from "./priceType/LimitOrder";
import styles from "./ScheduledOrder.module.css";
import { IOrderProps } from "../../definitions";

const ScheduledOrder: React.FC<IOrderProps> = ({ initialMarketPrice, mode }) => {
  // 감시 가격 상태 관리
  const [trackedPrice, setTrackedPrice] = useState(initialMarketPrice);

  // 호가 가격 단위 계산 함수
  const getTickSize = (trackedPrice: number) => {
    if (trackedPrice < 2000) return 1;
    if (trackedPrice < 5000) return 5;
    if (trackedPrice < 20000) return 10;
    if (trackedPrice < 50000) return 50;
    if (trackedPrice < 200000) return 100;
    if (trackedPrice < 500000) return 500;
    return 1000;
  };

  // 가격 증가 함수
  const increaseTrackedPrice = () => {
    const tickSize = getTickSize(trackedPrice);
    setTrackedPrice(trackedPrice + tickSize);
  };

  // 가격 감소 함수
  const decreaseTrackedPrice = () => {
    const tickSize = getTickSize(trackedPrice);
    setTrackedPrice(trackedPrice - tickSize > 0 ? trackedPrice - tickSize : 0);
  };

  // 가격 입력란에 숫자만 입력되도록 제한하는 함수
  const handleTrackedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputPrice = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0;
    setTrackedPrice(inputPrice);
  };

  const TABS = [
    { label: "지정가 주문", component: <LimitOrder initialMarketPrice={initialMarketPrice} mode={mode} trackedPrice={trackedPrice} /> },
    { label: "시장가 주문", component: <MarketOrder mode={mode} trackedPrice={trackedPrice} /> },
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
      <div
        className={styles.inputContainer}
        onMouseDown={(event) => {
          event.stopPropagation(); // 클릭 시 드래그 방지
        }}
      >
        <div className={styles.title}>감시 가격</div>
        <div className={styles.inputBox}>
          <input
            type="text"
            value={`${trackedPrice.toLocaleString()}원`}
            onChange={handleTrackedPriceChange}
          />
          <button onClick={decreaseTrackedPrice}>−</button>
          <button onClick={increaseTrackedPrice}>+</button>
        </div>
      </div>

      {/* 선택된 탭의 컴포넌트 렌더링 */}
      <div>{TABS[selectedTab].component}</div>
    </div>
  );
};

export default ScheduledOrder
