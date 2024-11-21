import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Favorite.module.css';
import { useFavoriteStore } from '../../../store/useFavoriteStore';
import useSocketStore, { sendMessage } from '../../../store/useSocketStore';
import { COLORS } from '../../../common/utils';
import { IFavoriteData } from '../../../store/definitions';

const Favorites = () => {
  const { favoriteData, fetchFavoriteData } = useFavoriteStore();
  // const postFavoriteData = useFavoriteStore((state) => state.postFavoriteData);
  const deleteFavoriteData = useFavoriteStore((state) => state.deleteFavoriteData);
  const { stockCodeData, tradingData } = useSocketStore();
  const [isEdit, setIsEdit] = useState(false);

  const [renderedFavoriteDataList, setRenderedFavoriteDataList] = useState<IFavoriteData[] | null>(null);

  const navigate = useNavigate();

  const handleEdit = () => {
    setIsEdit((prev) => !prev); // 상태를 반전
  };

  const handleDelete = (stockCode: string) => (_: React.MouseEvent<HTMLDivElement>) => {
    sendMessage({
      stock_code: stockCode,
      exit: "True"
    })
    deleteFavoriteData(stockCode);
    fetchFavoriteData();
  };

  useEffect(() => {
    if (!favoriteData) return;

    setRenderedFavoriteDataList(favoriteData);
  }, [favoriteData])

  useEffect(() => {
    if (!renderedFavoriteDataList || !stockCodeData || !tradingData) return;

    setRenderedFavoriteDataList((prevList) => {
      const updateList = prevList!.map((stock) => {
        if (stock.stock_code == stockCodeData) {
          const previousPrice = Number(stock.stock_price) - Number(stock.fluctuation_difference);
          const fluctuationDifference = Number(tradingData.STCK_PRPR) - previousPrice;
          const fluctuationRate = (fluctuationDifference / previousPrice) * 100;

          return {
            ...stock,
            fluctuation_difference: fluctuationDifference.toString(),
            fluctuation_rate: fluctuationRate.toString(),
            stock_price: tradingData.STCK_PRPR.toString(),
          };
        }
        return stock;
      });
      return updateList;
    })
  }, [stockCodeData, tradingData])

  if (!renderedFavoriteDataList || renderedFavoriteDataList.length === 0 || renderedFavoriteDataList[0].stock_code === "") return <div />;

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {/* <div className={styles.addButton} onClick=""> */}
        {/* <div className={styles.addButton}>
          <div className={styles.addIconContainer}>
            <span className={styles.addIcon}>+</span>
          </div>
          추가하기
        </div> */}

        <div className={styles.editButton} onClick={handleEdit}>
          <div className={styles.editBtn}>
            {isEdit ? "완료" : "편집"} {/* 상태에 따라 텍스트 변경 */}
          </div>
        </div>
        {/* get 요청에서 종목코드, 시장가, 등락률 보내준다고 가정하고 코드 작성 */}
        {renderedFavoriteDataList.map((stock, index) => (
          <div key={index} className={styles.stockItem} onClick={() => navigate(`dashboard/${stock.stock_code}`)}>
            <div className={styles.stockInfo}>
              <span className={styles.stockName}>{stock.stock_name}</span>
            </div>
            <div className={styles.stockDetails}>
              <div className={styles.stockPrice}>
                {parseInt(stock.stock_price).toLocaleString()}원
                <div className={styles.stockChange}>
                  <span style={{ color: Number(stock.fluctuation_rate) > 0 ? COLORS.positive : Number(stock.fluctuation_rate) < 0? COLORS.negative : COLORS.neutral }}>
                    {Number(stock.fluctuation_rate) > 0 ? '+' : ''}{parseInt(stock.fluctuation_difference).toLocaleString()}원
                  </span>
                  &nbsp;
                  <span
                    className={styles.percentage}
                    style={{ color: Number(stock.fluctuation_rate) > 0 ? COLORS.positive : Number(stock.fluctuation_rate) < 0 ? COLORS.negative : COLORS.neutral }}>
                    ({Number(stock.fluctuation_rate).toFixed(2).toLocaleString()}%)
                  </span>
                </div>
              </div>
              {isEdit ? <div className={styles.deleteButton} onClick={handleDelete(stock.stock_code)}>
                <div className={styles.deleteBtn}>삭제</div>
              </div> : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
