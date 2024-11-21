import { useNavigate } from "react-router-dom";

import { IStockInfoProps } from "./definitions";

import styles from './StockInfo.module.css';

const StockInfo: React.FC<IStockInfoProps> = ({ stockRankingData }) => {
  const navigate = useNavigate();

  const clickStock = () => {
    const stockCode = stockRankingData.mksc_shrn_iscd ? stockRankingData.mksc_shrn_iscd : stockRankingData.stck_shrn_iscd;
    navigate(`/dashboard/${stockCode}`);
  };

  return (
    <div className={styles.stockInfoContainer}>
      <div className={styles.companyInfo} onClick={clickStock}>
        <div className={styles.dataRank}>{stockRankingData.data_rank}</div>
        {/* <img src={logoLink || ''} alt="기업 로고" className={styles.logo} /> */}
        <div className={styles.stockName}>{stockRankingData.hts_kor_isnm}</div>
      </div>
      <div className={styles.priceData}  onClick={clickStock}>
        <div>{Number(stockRankingData.stck_prpr).toLocaleString()}원</div>
        <div
          className={`${styles.previousDayVersusData} ${
            Number(stockRankingData.prdy_vrss) > 0
              ? styles.previousDayVersusPricePlus
              : styles.previousDayVersusPriceMinus
          }`}
        >
          {Number(stockRankingData.prdy_vrss) > 0
            ? '▲'
            : Number(stockRankingData.prdy_vrss) < 0
            ? '▼'
            : ''}{' '}
          {Math.abs(Number(stockRankingData.prdy_vrss)).toLocaleString()}원 (
          {Number(stockRankingData.prdy_ctrt).toFixed(1).toLocaleString()}%)
        </div>
      </div>
    </div>
  );
};

export default StockInfo;
