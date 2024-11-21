// 지정가 주문

import React, { useState } from "react";
import styles from "./LimitOrder.module.css"
import { IOrderTypeProps } from "../../../definitions";
import OrderButton from "../../OrderButton";

const LimitOrder: React.FC<IOrderTypeProps> = ({ initialMarketPrice, mode, trackedPrice }) => {
  // 구매 가격과 수량 상태 관리
  const [price, setPrice] = useState(initialMarketPrice);
  const [quantity, setQuantity] = useState<string | number>("");

  // 호가 가격 단위 계산 함수
  const getTickSize = (price: number) => {
    if (price < 2000) return 1;
    if (price < 5000) return 5;
    if (price < 20000) return 10;
    if (price < 50000) return 50;
    if (price < 200000) return 100;
    if (price < 500000) return 500;
    return 1000;
  };

  // 가격 증가 함수
  const increasePrice = () => {
    const tickSize = getTickSize(price);
    setPrice(price + tickSize);
  };

  // 가격 감소 함수
  const decreasePrice = () => {
    const tickSize = getTickSize(price);
    setPrice(price - tickSize > 0 ? price - tickSize : 0);
  };

  // 가격 입력란에 숫자만 입력되도록 제한하는 함수
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputPrice = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0;
    setPrice(inputPrice);
  };

  // 수량 증가 함수
  const increaseQuantity = () => setQuantity(prev => (prev === "" ? 1 : (Number(prev) + 1)));

  // 수량 감소 함수
  const decreaseQuantity = () => setQuantity(prev => (prev === "" ? 1 : Math.max(1, Number(prev) - 1)));

  // 수량 입력란에 숫자만 입력되도록 제한하는 함수
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputQuantity = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    setQuantity(inputQuantity >= 1 ? inputQuantity : "");
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.inputContainer}
        onMouseDown={(event) => {
          event.stopPropagation(); // 클릭 시 드래그 방지
        }}
      >
        <div className={styles.title}>{mode === "BUY" ? "구매 가격" : "판매 가격"}</div>
        <div className={styles.inputBox}>
          <input
            type="text"
            value={`${price.toLocaleString()}원`}
            onChange={handlePriceChange}
          />
          <button onClick={decreasePrice}>−</button>
          <button onClick={increasePrice}>+</button>
        </div>
      </div>

      <div
        className={styles.inputContainer}
        onMouseDown={(event) => {
          event.stopPropagation(); // 클릭 시 드래그 방지
        }}
      >
        <div className={styles.title}>수량</div>
        <div className={styles.inputBox}>
          <input
            type="text"
            value={quantity !== "" ? `${quantity} 주` : ""}
            onChange={handleQuantityChange}
            placeholder="수량을 입력하세요"
          />
          <button onClick={decreaseQuantity}>−</button>
          <button onClick={increaseQuantity}>+</button>
        </div>
      </div>

      {/* OrderButton 컴포넌트에 props 전달 */}
      <OrderButton mode={mode} trackedPrice={trackedPrice} price={price} quantity={quantity} />
    </div>
  );
};

export default LimitOrder
