import { useEffect } from 'react';

import Indicators from '../home/indicators/Indicators';
import Account from '../home/account/HomeAccount';
import UserRanking from '../home/userRanking/UserRanking';
import StockRanking from '../home/stockRanking/StockRanking';
import { useIndexStore } from '../store/useIndexStore';
import { useLoginStore } from '../store/useLoginStore';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { sendMessage } from '../store/useSocketStore';

import styles from './HomePage.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage: React.FC = () => {
  const { indexData, fetchIndexData } = useIndexStore();
  const { loginToken, login } = useLoginStore();
  const { favoriteData, fetchFavoriteData } = useFavoriteStore();

  useEffect(() => {
    fetchIndexData();
    // 여기에다가 로그인 로직 작성해야지
    login();
  }, []);

  useEffect(() => {
    if (!loginToken) return;

    fetchFavoriteData();
  }, [loginToken])

  useEffect(() => {
    if (!favoriteData || favoriteData.length === 0) return;

    favoriteData.map((data) => {
      sendMessage({
        stock_code: data.stock_code
      })
    })
  }, [favoriteData])

  if (!indexData || !favoriteData) return <div />;

  return (
    <>
      <Indicators />

      <section className={styles.mainContent}>
        <Account />
        <UserRanking />
        <StockRanking />
      </section>
    </>
  );
};

export default HomePage;
