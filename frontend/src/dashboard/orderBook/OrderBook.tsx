import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { usePastStockStore } from '../../store/usePastStockStore';
import { useMinuteStockStore } from '../../store/useMinuteStockStore';
import useSocketStore from '../../store/useSocketStore';
import useStockLimit from '../../common/hooks/useStockLimit';
import { IOrderBookData, ITradingData } from '../../store/definitions';

import styles from './OrderBook.module.css';
import { COLORS } from '../../common/utils';

const OrderBook: React.FC = () => {
  const { stockCode } = useParams();

  const { yesterdayStockData } = usePastStockStore();
  const { minuteStockData } = useMinuteStockStore();
  const { stockCodeData, orderBookData, tradingData } = useSocketStore();

  const currentPrice = Number(yesterdayStockData);                     // 기준가
  const { maxAskPrice, minBidPrice } = useStockLimit();                // 상한가와 하한가
  const [maxPrice, setMaxPrice] = useState(Number.NEGATIVE_INFINITY);  // 최고가
  const [minPrice, setMinPrice] = useState(Number.POSITIVE_INFINITY);  // 최저가
  const [quantity, setQuantity] = useState(0);                         // 거래량

  const [renderedTradingData, setRenderedTradingData] = useState<ITradingData[] | null>(null);
  const [renderedOrderBookData, setRenderedOrderBookData] = useState<IOrderBookData | null>(null);

  useEffect(() => {
    setMaxPrice(minuteStockData!.reduce((maxValue, data) => {
      return Number(data.stck_prpr) > maxValue ? Number(data.stck_prpr) : maxValue;
    }, Number.NEGATIVE_INFINITY));

    setMinPrice(minuteStockData!.reduce((minValue, data) => {
      return Number(data.stck_prpr) < minValue ? Number(data.stck_prpr) : minValue;
    }, Number.POSITIVE_INFINITY));
  }, [])

  useEffect(() => {
    if (!tradingData || stockCodeData != stockCode) return;

    setQuantity(Number(tradingData!.ACML_VOL));
    setMaxPrice(Number(tradingData.STCK_PRPR) > maxPrice ? Number(tradingData.STCK_PRPR) : maxPrice);
    setMinPrice(Number(tradingData.STCK_PRPR) < minPrice ? Number(tradingData.STCK_PRPR) : minPrice);
    setRenderedTradingData((prevData) => {
      // 새로운 데이터 추가 및 정렬
      const updatedData = [...(prevData || []), tradingData].sort(
        (a, b) => Number(b.STCK_CNTG_HOUR) - Number(a.STCK_CNTG_HOUR)
      );
    
      // 최신 10개 데이터 유지
      return updatedData.slice(0, 20);
    });
  }, [stockCode, stockCodeData, tradingData])

  useEffect(() => {
    if (!orderBookData || stockCodeData != stockCode) return;
    
    setRenderedOrderBookData(orderBookData);
  }, [stockCodeData, orderBookData])

  // 스크롤을 중간 위치로 설정
  const scrollFlag = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // 스크롤을 중간 위치로 맞추기 위해 약간의 지연을 줌
    if (!scrollFlag.current && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight / 5;
      scrollFlag.current = true;
    }
  }, [orderBookData, tradingData]);

  if (!orderBookData || !tradingData || !renderedTradingData || !renderedOrderBookData) return <div className={styles.loading} />;

  return (
    <div className={styles.container}>
      <div className={styles.categoryTabs}>호가</div>
      {/* <div className={styles.marketInfo}>
        <p>시간외단일가 56,800원 <span className={styles.priceChange}>+0.35%</span></p>
      </div> */}

      <div className={styles.content} ref={contentRef}>
        {/* <div className={styles.content}> */}

        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th>매도잔량</th>
              <th>가격</th>
              <th>매수잔량</th>
            </tr>
          </thead>
          <tbody>
            {/* 매도 데이터 */}
            {[...Array(10)].map((_, i) => (
              <tr key={`ask-${i}`} className={styles.orderRow}>
                <td className={styles.askVolume}>{Number(renderedOrderBookData[`ASKP_RSQN${10 - i}`]).toLocaleString()}</td>
                <td
                  className={styles.askPrice}
                  style={{ color: Number(renderedOrderBookData[`ASKP${10 - i}`]) > currentPrice ? COLORS.positive : Number(renderedOrderBookData[`ASKP${10 - i}`]) < currentPrice ? COLORS.negative : "#bbb" }}
                >
                  {Number(renderedOrderBookData[`ASKP${10 - i}`]).toLocaleString()}
                </td>
                {i === 0 && (
                  <td className={styles.askInfo} rowSpan={10}>
                    <div className={styles.askInfoContainer}>
                      <div className={styles.detailInfo}>상한가<br></br>{maxAskPrice.toLocaleString()}</div>
                      <div className={styles.detailInfo}>하한가<br></br>{minBidPrice.toLocaleString()}</div>
                    </div>
                    <div className={styles.askInfoContainer}>
                      <div className={styles.detailInfo}>최고가<br></br><span style={{ color: "#CF5055" }}>{maxPrice.toLocaleString()}</span></div>
                      <div className={styles.detailInfo}>최저가<br></br><span style={{ color: "#4881FF" }}>{minPrice.toLocaleString()}</span></div>
                    </div>
                    <div className={styles.detailInfo}>거래량<br></br>{quantity.toLocaleString()}</div>
                  </td>
                )}
              </tr>
            ))}

            {/* 구분선 */}
            <tr style={{ borderTop: '3px solid #333' }}></tr>

            {/* 매수 데이터 */}
            {[...Array(10)].map((_, i) => (
              <tr key={`bid-${i}`} className={styles.orderRow}>
                {i === 0 && renderedTradingData.length > 0 && (
                  <td className={styles.bidInfo} rowSpan={10}>
                    {renderedTradingData.map((data, index) => (
                      <div key={`info-${index}`} className={styles.bidDetail}>
                        <span className={styles.bidVol}>
                          {Number(Math.round(data.STCK_PRPR)).toLocaleString()}
                        </span>
                        <span className={styles.bidQty} style={{
                          color: data.CCLD_DVSN === 1 ? '#CF5055' :
                                data.CCLD_DVSN === 5 ? '#4881FF' : '#1EA083',
                        }}>
                          {Number(data.CNTG_VOL).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </td>
                )}
                <td
                  className={styles.bidPrice}
                  style={{ color: Number(renderedOrderBookData[`BIDP${i + 1}`]) > currentPrice ? COLORS.positive : Number(renderedOrderBookData[`BIDP${i + 1}`]) < currentPrice ? COLORS.negative : "#bbb" }}
                >
                  {Number(renderedOrderBookData[`BIDP${i + 1}`]).toLocaleString()}
                </td>
                <td className={styles.bidVolume}>{Number(renderedOrderBookData[`BIDP_RSQN${i + 1}`]).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.summary}>
        <p className={styles.askSummary}>
          <span>판매대기</span>
          {renderedOrderBookData.TOTAL_ASKP_RSQN.toLocaleString()}
        </p>
        <p className={styles.marketStatus}>정규장</p>
        <p className={styles.bidSummary}>
          <span>구매대기</span>
          {renderedOrderBookData.TOTAL_BIDP_RSQN.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default OrderBook;
