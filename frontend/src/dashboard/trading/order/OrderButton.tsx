import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import codeToName from '../../../assets/codeToName.json';
import { IOrderButtonProps } from '../definitions';
import styles from './OrderButton.module.css';
import { useBalanceStore } from '../../../store/useBalanceStore';
import useStockLimit from '../../../common/hooks/useStockLimit';
import useOrderButton from './useOrderButton';
import { useStandardHistoryStore } from '../../../store/useHistoryStore';
import { useScheduledHistoryStore } from '../../../store/useHistoryStore';

const OrderButton: React.FC<IOrderButtonProps> = ({ mode, trackedPrice, price, quantity }) => {
  const { placeOrder } = useOrderButton();
  const { balanceData, fetchBalanceData } = useBalanceStore();
  const { maxAskPrice, minBidPrice } = useStockLimit();
  const { fetchStandardHistoryData } = useStandardHistoryStore();
  const { fetchScheduledHistoryData } = useScheduledHistoryStore();
  const finalQuantity = typeof quantity === 'number' ? quantity : 0;
  const totalPrice = price * finalQuantity;
  const totalUpperPrice = maxAskPrice * finalQuantity;
  const totalLowerPrice = minBidPrice * finalQuantity;
  const { stockCode } = useParams();
  const stockName =
    stockCode && stockCode in codeToName ? codeToName[stockCode as keyof typeof codeToName] : '';

  useEffect(() => {
    fetchBalanceData();
  }, []);

  // 판매 가능 수량 계산
  const availableShares = mode === "SELL" && balanceData
  ? balanceData.holdings.find(holding => holding.stock_name === stockName)?.total_amount || 0
  : 0;

  const isDisabled =
    finalQuantity === 0 || // 수량이 0이거나
    (mode === 'BUY' && price !== 0 && balanceData && balanceData.balance < totalPrice) || // BUY 모드 지정가에서 구매 가능 금액이 총 구매 가격보다 적거나
    (mode === 'BUY' && price === 0 && balanceData && balanceData.balance < totalUpperPrice) || // BUY 모드 시장가에서 구매 가능 금액이 최대 구매 가격보다 적거나
    (mode === 'SELL' && availableShares !== null && availableShares < finalQuantity); // SELL 모드에서 판매 가능 수량이 총 판매 수량보다 적은 경우

  return (
    <div className={styles.bottomContainer}>
      {/* 구매가능금액 & 판매가능수량 */}
      <div className={styles.limitContainer}>
        {mode === 'BUY' && balanceData && (
          <>
            <p>구매 가능 금액</p>
            <p>{balanceData.balance.toLocaleString()}원</p>
          </>
        )}
        {mode === 'SELL' && (
          <>
            <p>판매 가능 수량</p>
            <p>{availableShares}주</p>
          </>
        )}
      </div>

      {/* 구매/판매 & 시장가/지정가 4가지 유형에 따라 출력 문구 설정 */}
      <div className={styles.totalContainer}>
        {price !== 0 ? (
          <>
            <p>총 {mode === 'BUY' ? '구매' : '판매'} 가격</p>
            <p>{totalPrice.toLocaleString()}원</p>
          </>
        ) : (
          <>
            <p>{mode === 'BUY' ? '최대 구매' : '최소 판매'} 가격</p>
            <p>{(mode === 'BUY' ? totalUpperPrice : totalLowerPrice).toLocaleString()}원</p>
          </>
        )}
      </div>

      {/* 버튼 */}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.orderButton} ${mode === 'BUY' ? styles.buy : styles.sell}`}
          disabled={isDisabled}
          onMouseDown={(event) => {
            event.stopPropagation(); // 클릭 시 드래그 방지
          }}
          onClick={() => {
            if (stockCode) {
              placeOrder({ stockCode, mode, trackedPrice, price, finalQuantity });
              fetchStandardHistoryData();
              fetchScheduledHistoryData();
            } else {
              console.error('Stock code is undefined. Cannot place order.');
            }
          }}
        >
          {mode === 'BUY' ? '구 매 하 기' : '판 매 하 기'}
        </button>
      </div>
    </div>
  );
};

export default OrderButton;
