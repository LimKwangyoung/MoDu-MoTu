import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import fetchTraderTrend from "./hooks/fetchTraderTrend";
import { ITrader } from "./definitions";

import styles from "./TradingTrend.module.css";

const Trader = () => {
  const { stockCode } = useParams();
  const [renderedTraderData, setRenderedTraderData] = useState<ITrader | null>(null);
  const [maxSell, setMaxSell] = useState(0);
  const [maxBuy, setMaxBuy] = useState(0);

  useEffect(() => {
    if (!stockCode) return;

    const fetchData = async () => {
      try {
        const data = await fetchTraderTrend("trader", stockCode);
        setRenderedTraderData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData()
  }, [stockCode])

  useEffect(() => {
    if (!renderedTraderData) return;

    setMaxSell(Math.max(
      Number(renderedTraderData.total_seln_qty1),
      Number(renderedTraderData.total_seln_qty2),
      Number(renderedTraderData.total_seln_qty3),
      Number(renderedTraderData.total_seln_qty4),
      Number(renderedTraderData.total_seln_qty5)
    ));
    setMaxBuy(Math.max(
      Number(renderedTraderData.total_shnu_qty1),
      Number(renderedTraderData.total_shnu_qty2),
      Number(renderedTraderData.total_shnu_qty3),
      Number(renderedTraderData.total_shnu_qty4),
      Number(renderedTraderData.total_shnu_qty5)
    ));

  }, [renderedTraderData])

  if (!renderedTraderData) return <div />;

  return (
    <div className={styles.subContent}>
      <table className={styles.traderTable}>
        <thead>
          <tr>
            <th className={styles.thDiff}>증감</th>
            <th colSpan={2} className={styles.thAmount}>매도상위</th>
            <th colSpan={2} className={styles.thAmount}>매수상위</th>
            <th className={styles.thDiff}>증감</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              {/* 매도 */}
              <td className={styles.sellDiff}>{Number(renderedTraderData[`seln_qty_icdc${index + 1}`]).toLocaleString()}</td>
              <td colSpan={2} className={styles.barCell}>
                <div
                  className={styles.sellBar}
                  style={{
                    width: `${(Number(renderedTraderData[`total_seln_qty${index + 1}`]) / maxSell) * 100}%`,
                  }}
                ></div>
                <div className={styles.barText}>
                  <span>{Number(renderedTraderData[`total_seln_qty${index + 1}`]).toLocaleString()}</span>
                  <span className={styles.company}>{renderedTraderData[`seln_mbcr_name${index + 1}`]}</span>
                </div>
              </td>

              {/* 매수 */}
              <td colSpan={2} className={styles.barCell}>
                <div
                  className={styles.buyBar}
                  style={{
                    width: `${(Number(renderedTraderData[`total_shnu_qty${index + 1}`]) / maxBuy) * 100}%`,
                  }}
                ></div>
                <div className={styles.barText}>
                  <span className={styles.company}>{renderedTraderData[`shnu_mbcr_name${index + 1}`]}</span>
                  <span>{Number(renderedTraderData[`total_shnu_qty${index + 1}`]).toLocaleString()}</span>
                </div>
              </td>
              <td className={styles.buyDiff}>{Number(renderedTraderData[`shnu_qty_icdc${index + 1}`]).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        <span className={styles.sellForeignVolume}>
          {Number(renderedTraderData.glob_total_seln_qty).toLocaleString()}
        </span>
        <span className={styles.titleForeignVolume}>외국계 추정 거래량</span>
        <span className={styles.buyForeignVolume}>
          {Number(renderedTraderData.glob_total_shnu_qty).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default Trader;
