import { useState, useEffect } from 'react';

import fetchStockRanking from './hooks/fetchStockRanking';
import StockInfo from './StockInfo';
import { IStockRankingData } from './definitions';

// import samsungLogo from '../../assets/images/samsung.png';
import styles from './StockRanking.module.css';

const StockRanking = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('거래 대금');
  const [renderedStockRankingData, setRenderedStockData] = useState([]);

  const categories = ['거래 대금', '거래량', '급상승', '급하락'];
  const categoryToKeyword: { [key: string]: string } = {
    '거래 대금': 'amount',
    거래량: 'volume',
    급상승: 'advance',
    급하락: 'decline',
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`오늘 ${hours}:${minutes} 기준`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const keyword = categoryToKeyword[selectedCategory];
      try {
        const data = await fetchStockRanking(keyword);
        setRenderedStockData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    updateCurrentTime();

    const intervalId = setInterval(() => {
      fetchData();
      updateCurrentTime();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [selectedCategory]);

  if (!renderedStockRankingData || renderedStockRankingData.length === 0) return <div />;

  return (
    <div className={styles.container}>
      <div className={styles.categoryTab}>
        종목 랭킹
        <div className={styles.time}>{currentTime}</div>
      </div>

      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${'tabButton'} ${selectedCategory === category ? 'activeTab' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {renderedStockRankingData
          .slice(0, 5)
          .map((stockRankingData: IStockRankingData, index: number) => (
            <StockInfo key={index} stockRankingData={stockRankingData} />
          ))}
      </div>
    </div>
  );
};

export default StockRanking;
