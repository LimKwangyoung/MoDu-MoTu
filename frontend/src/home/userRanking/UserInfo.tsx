import styles from './UserInfo.module.css';
import { IUserInfoProps } from './definition';

const UserInfo = ({ dataRank, userName, profit }: IUserInfoProps) => {
  const selectMedal = (rank: number) => {
    if (rank === 1) {
      return '🥇';
    } else if (rank === 2) {
      return '🥈';
    } else if (rank === 3) {
      return '🥉';
    }
    return null;
  };

  // profit에 양수일 때는 '+'를, 음수일 때는 '-'를 추가하는 함수
  const formatProfit = (value: number) => {
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <div className={styles.userInfoContainer}>
      <div className={styles.userInfo}>
        <div className={styles.medal}>{selectMedal(dataRank)}</div>
        <div className={styles.userName}>{userName}</div>
      </div>
      <div className={profit > 0 ? `${styles.isProfitPlus}` : `${styles.isProfitMinus}`}>
        {formatProfit(profit)}%
      </div>
    </div>
  );
};

export default UserInfo;
