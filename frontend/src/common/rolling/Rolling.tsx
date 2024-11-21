import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIndexStore } from '../../store/useIndexStore';
import useSocketStore from '../../store/useSocketStore';
import { IIndexEntry } from '../../store/definitions';

import styles from './Rolling.module.css';

const Rolling = () => {
  const { indexData } = useIndexStore();
  const { kospiData, kosdaqData } = useSocketStore();

  const [formattedData, setFormattedData] = useState<JSX.Element[] | null>(null);
  const [isPaused, setIsPaused] = useState(false); // 전체 애니메이션 상태

  const navigate = useNavigate();

  useEffect(() => {
    if (!indexData) return;

    const updatedData = Object.entries(indexData).flatMap(([key, indices], index) => {
      return Object.entries(indices as Record<string, IIndexEntry[]>).map(([subKey, data]) => {
        const previous = data[data.length - 2];
        let current;
        if (kospiData && subKey === '코스피') {
          current = kospiData;
        } else if (kosdaqData && subKey === '코스닥') {
          current = kosdaqData;
        } else {
          current = data[data.length - 1];
          // console.log(current);
        }

        const previousValue = Number(
          previous.bstp_nmix_prpr ? previous.bstp_nmix_prpr : previous.ovrs_nmix_prpr
        );
        const currentValue = Number(
          typeof current !== 'object'
            ? current
            : 'bstp_nmix_prpr' in current
            ? current.bstp_nmix_prpr
            : 'ovrs_nmix_prpr' in current
            ? current.ovrs_nmix_prpr
            : '0'
        );

        const change = currentValue - previousValue;
        const changeClass = change >= 0 ? styles.positive : styles.negative;

        return (
          <div
            key={`${key}-${subKey}`}
            className={styles.indexItem}
            onMouseEnter={() => setIsPaused(true)} // 마우스가 `indexItem`에 들어오면 멈춤
            onMouseLeave={() => setIsPaused(false)} // 마우스가 나가면 실행
            onClick={() => navigate(`/market/${index}`)}
          >
            <span className={styles.subKey}>{subKey}</span>
            <span className={styles.value}>{Number(currentValue.toFixed(2)).toLocaleString()}</span>
            <span className={changeClass}>
              {change >= 0 ? ' +' : ''}
              {Number(change.toFixed(2)).toLocaleString()} (
              {Number(((change / previousValue) * 100).toFixed(2)).toLocaleString()}%)
            </span>
          </div>
        );
      });
    });

    setFormattedData(updatedData);
  }, [indexData, kospiData, kosdaqData]);

  if (!formattedData) {
    return <div className={styles.rolling} />;
  }

  return (
    <div className={styles.rolling}>
      <div
        className={`${styles.inner} ${isPaused ? styles.paused : ''}`} // 상태에 따라 클래스 변경
      >
        {formattedData}
        {formattedData}
      </div>
    </div>
  );
};

export default Rolling;
