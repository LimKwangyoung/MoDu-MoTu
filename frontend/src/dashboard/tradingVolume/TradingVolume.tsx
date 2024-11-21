import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import useSocketStore from '../../store/useSocketStore';
import { ITradingData } from '../../store/definitions';

import styles from './TradingVolume.module.css';

const TradingVolume: React.FC = () => {
  const { stockCode } = useParams();
  const { stockCodeData, tradingData } = useSocketStore();
  const [renderedTradingData, setRenderedTradingData] = useState<ITradingData[]>([]);

  useEffect(() => {
    if (!tradingData || stockCode != stockCodeData) return;

    setRenderedTradingData((prevData) => {
      const updatedData = [...prevData, tradingData];
      return updatedData.sort((a, b) => Number(b.STCK_CNTG_HOUR) - Number(a.STCK_CNTG_HOUR));
    });
  }, [stockCodeData, tradingData]);

  if (!renderedTradingData) return <div />;

  return (
    <div className={styles.container}>
      <div className={styles.categoryTabs}>시세</div>

      <div className={`content ${styles.content}`}>
        <table className={styles.tradingTable}>
          <thead>
            <tr>
              <td>체결가</td>
              <td>체결량</td>
              <td>거래량</td>
              <td>시간</td>
            </tr>
          </thead>
          <tbody>
            {renderedTradingData.map((data, idx) => (
              <tr key={idx}>
                <td className={styles.tradePrice}>{Number(Math.round(data.STCK_PRPR)).toLocaleString()}</td>
                <td
                  className={styles.tradeVolume}
                  style={{
                    color:
                      data.CCLD_DVSN === 1
                        ? '#CF5055'
                        : data.CCLD_DVSN === 5
                        ? '#4881FF'
                        : '#1EA083',
                  }}
                >
                  {Number(data.CNTG_VOL).toLocaleString()}
                </td>
                <td className={styles.acmlVolume}>{Number(data.ACML_VOL).toLocaleString()}</td>
                <td className={styles.tradeTime}>
                  {data.STCK_CNTG_HOUR.toString().slice(0, 2)}:
                  {data.STCK_CNTG_HOUR.toString().slice(2, 4)}:
                  {data.STCK_CNTG_HOUR.toString().slice(4, 6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingVolume;
