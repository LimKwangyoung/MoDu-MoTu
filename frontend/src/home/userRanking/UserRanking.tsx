import styles from './UserRanking.module.css';
import UserInfo from './UserInfo';
import { useState } from 'react';

const UserRanking = () => {
  const [weeklyRanking] = useState([
    {
      dataRank: 1,
      userName: 'oodeng98',
      profit: 65.8,
    },
    {
      dataRank: 2,
      userName: 'ssafyyong4',
      profit: 56.3,
    },
    {
      dataRank: 3,
      userName: 'andcookie',
      profit: -12.6,
    },
  ]);
  const [totalRanking] = useState([
    {
      dataRank: 1,
      userName: 'sso756',
      profit: 396.4,
    },
    {
      dataRank: 2,
      userName: 'kokoz22',
      profit: 312.2,
    },
    {
      dataRank: 3,
      userName: 'woojeanie',
      profit: 251.2,
    },
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.categoryTabs}>모의투자 랭킹</div>

      <div className={styles.content}>
        <div className={styles.weekly}>
          <div className={styles.rankname}>주간 수익률</div>
          <div className={styles.rankList}>
            {weeklyRanking.map((user, index) => (
              <UserInfo key={index} {...user} />
            ))}
          </div>
        </div>

        <div className={styles.total}>
          <div className={styles.rankname}>전체 수익률</div>
          <div className={styles.rankList}>
            {totalRanking.map((user, index) => (
              <UserInfo key={index} {...user} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRanking;
