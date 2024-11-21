import { useEffect, useState } from "react";
import { usePastStockStore } from "../../store/usePastStockStore";

import styles from "./TradingTrend.module.css";
import { IStockData } from "../../store/definitions";

const Daily = () => {
  const { dailyPastStockData } = usePastStockStore();
  const [renderedDailyPastStockData, setRenderedDailyPastStockData] = useState<IStockData[] | null>(null);

  useEffect(() => {
    if (!dailyPastStockData) return;

    setRenderedDailyPastStockData([...dailyPastStockData].reverse());
  }, [dailyPastStockData])

  if (!renderedDailyPastStockData) return <div />;

  return (
    <div className={styles.subContent}>
      <table>
        <thead>
          <tr className={styles.tableHeader}>
            <th className={styles.thDate}>일자</th>
            <th className={styles.thPrice}>주가</th>
            <th className={styles.thChange}>대비</th>
            <th className={styles.thRate}>등락률</th>
            <th className={styles.thVolume}>거래량</th>
          </tr>
        </thead>
        <tbody>
          {renderedDailyPastStockData.map((item, index) => (
            <tr key={index}>
              <td>{item.stck_bsop_date.slice(0, 4)}-{item.stck_bsop_date.slice(4, 6)}-{item.stck_bsop_date.slice(6, 8)}</td>
              <td className={`${styles.tdPrice} ${Number(item.prdy_vrss) >= 0 ? styles.positive : styles.negative}`}>
                {Number(item.stck_clpr).toLocaleString()}
              </td>
              <td className={`${styles.tdChange} ${Number(item.prdy_vrss) >= 0 ? styles.positive : styles.negative}`}>
                {Number(item.prdy_vrss) >= 0 ? `▲ ${Number(item.prdy_vrss).toLocaleString()}` : `▼ ${Math.abs(Number(item.prdy_vrss)).toLocaleString()}`}
              </td>
              {index < renderedDailyPastStockData.length - 1 && (
                <td className={Number(item.prdy_vrss) >= 0 ? styles.positive : styles.negative}>
                  {Number(item.prdy_vrss) / Number(renderedDailyPastStockData[index + 1].stck_clpr) > 0 ? "+" : ""}{(Number(item.prdy_vrss) / Number(renderedDailyPastStockData[index + 1].stck_clpr) * 100).toFixed(2)}%
                </td>)}
              <td>{Number(item.acml_vol).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Daily;
