import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import codeToName from '../../assets/codeToName.json';
import { usePastStockStore } from '../../store/usePastStockStore';
import { useMinuteStockStore } from '../../store/useMinuteStockStore';
import useSocketStore, { sendMessage } from '../../store/useSocketStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';

import { IWidgetComponentProps } from '../../common/definitions';
import styles from './Symbol.module.css';
import { COLORS } from '../../common/utils';
import fetchInformation from './hooks/fetchInformation';

const Symbol = ({ setIsDraggable }: IWidgetComponentProps) => {
  const { stockCode } = useParams();

  // TODO: 실제 data를 넣어주세요
  const name = stockCode && stockCode in codeToName ? codeToName[stockCode as keyof typeof codeToName] : '';

  const { yesterdayStockData } = usePastStockStore();
  const { minuteStockData } = useMinuteStockStore();
  const { stockCodeData, tradingData } = useSocketStore();

  const [renderedValue, setRenderedValue] = useState(0);
  const [renderedChangeValue, setRenderedChangeValue] = useState(0);
  const [renderedChangeRate, setRenderedChangeRate] = useState(0);

  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [industry, setIndustry] = useState<string>("");
  const [companyDetail, setCompanyDetail] = useState<string>("");

  const favoriteData = useFavoriteStore((state) => state.favoriteData);
  const fetchFavoriteData = useFavoriteStore((state) => state.fetchFavoriteData);
  const postFavoriteData = useFavoriteStore((state) => state.postFavoriteData);
  const deleteFavoriteData = useFavoriteStore((state) => state.deleteFavoriteData);

  useEffect(() => {
    if (!stockCode) return;

    const fetchData = async () => {
      try {
        const data = await fetchInformation(stockCode);
        setIndustry(data.std_idst_clsf_cd_name);
        setCompanyDetail(data.idx_bztp_scls_cd_name);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData()
  }, [stockCode])

  useEffect(() => {
    if (!minuteStockData || minuteStockData.length === 0 || !yesterdayStockData) return;

    setRenderedValue(Number(minuteStockData![minuteStockData!.length - 1].stck_prpr));
    setRenderedChangeValue(
      Number(minuteStockData![minuteStockData!.length - 1].stck_prpr) - Number(yesterdayStockData)
    );
    setRenderedChangeRate(
      ((Number(minuteStockData![minuteStockData!.length - 1].stck_prpr) -
        Number(yesterdayStockData)) /
        Number(yesterdayStockData)) *
      100
    );
  }, [minuteStockData, yesterdayStockData]);

  // 여기부터 코드 다시 입력
  useEffect(() => {
    if (favoriteData && Array.isArray(favoriteData)) {
      const isFavoriteStock = favoriteData.some((item) => item.stock_code === stockCode);
      setIsFavorite(isFavoriteStock);
    } else {
      setIsFavorite(false);
    }
  }, [favoriteData, stockCode]);

  useEffect(() => {
    if (!tradingData || stockCode !== stockCodeData) return;

    setRenderedValue(Number(tradingData.STCK_PRPR));
    setRenderedChangeValue(Number(tradingData.STCK_PRPR) - Number(yesterdayStockData));
    setRenderedChangeRate(
      ((Number(tradingData.STCK_PRPR) - Number(yesterdayStockData)) / Number(yesterdayStockData)) *
      100
    );
  }, [stockCodeData, tradingData]);

  // TODO: 비즈니스 로직이니 분리하세요
  const toggleFavorite = () => {
    // TODO: post 요청을 통해 서버 상태 업데이트
    setIsFavorite((prev) => {
      const newValue = !prev;
      if (newValue) {
        postFavoriteData(stockCode as string);
      } else {
        deleteFavoriteData(stockCode as string);
      }
      return newValue;
    });
  };

  useEffect(() => {
    if (!stockCode) return;

    fetchFavoriteData();
    if (isFavorite) {
      sendMessage({
        stock_code: stockCode,
      });
    } else {
      sendMessage({
        stock_code: stockCode,
        exit: 'True',
      });
    }
  }, [isFavorite]);

  if (!industry || !companyDetail || !renderedChangeValue) return <div />;

  return (
    <div className={styles.container}>
      {/* 왼쪽 영역 */}
      <div className={styles.leftSection}>
        <div className={styles.nameSection}>
          <span className={styles.name}>{name}</span>
          <span
            className={isFavorite ? styles.heartActive : styles.heartInactive}
            onMouseDown={(event) => {
              event.stopPropagation();
              setIsDraggable(false);
            }}
            onClick={() => {
              toggleFavorite();
              setIsDraggable(true);
            }}
          >
            {isFavorite ? '♥' : '♡'}
          </span>
        </div>
        <div className={styles.details}>
          #{industry} #{companyDetail}
        </div>
      </div>

      {/* 오른쪽 영역 */}
      <div className={styles.rightSection}>
        <div
          className={styles.price}
        // style={{ color: renderedChangeValue >= 0 ? COLORS.positive : COLORS.negative }}
        >
          {Number(renderedValue.toFixed(0)).toLocaleString()}원
        </div>
        <div className={`${styles.change}`}>
          <span style={{ color: renderedChangeValue >= 0 ? COLORS.positive : COLORS.negative }}>
            {renderedChangeValue >= 0 ? '+' : ''}
            {Number(renderedChangeValue.toFixed(0)).toLocaleString()}원
          </span>
          <span style={{ color: renderedChangeValue >= 0 ? COLORS.positive : COLORS.negative }}>
            ({renderedChangeRate >= 0 ? '+' : ''}
            {renderedChangeRate.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Symbol;
