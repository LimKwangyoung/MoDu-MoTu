import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IndexChart from "../market/IndexChart";

import styles from "./MarketPage.module.css";
import { useIndexStore } from "../store/useIndexStore";

const MarketPage = () => {
  const { indexData, fetchIndexData } = useIndexStore();

  useEffect(() => {
    fetchIndexData();
  }, [])

  useEffect(() => {
    console.log(indexData)
  }, [indexData])

  const { indexTypeId } = useParams();
  const indexTypes = ["국내", "해외", "환율", "원자재"];
  const initialIndex = indexTypeId && indexTypes[parseInt(indexTypeId, 10)] ? indexTypes[parseInt(indexTypeId, 10)] : "국내";

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  if (!indexData) return <div />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>오늘의 지수</h1>
        <div className={styles.tabs}>
          {indexTypes.map((type) => (
            <button
              key={type}
              className={`${styles.tab} ${selectedIndex === type ? styles.activeTab : ""
                }`}
              onClick={() => setSelectedIndex(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className={styles.chartContainer}>
          <IndexChart indexType={selectedIndex} />
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
