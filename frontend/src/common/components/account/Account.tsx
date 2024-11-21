import { useState, CSSProperties } from 'react';
import Balance from './Balance';
import History from './History';
import Favorites from './Favorite';
import styles from './Account.module.css';

const Account: React.FC<{ contentStyle?: CSSProperties; isMyPage?: boolean }> = ({ contentStyle, isMyPage }) => {
  const [selectedCategory, setSelectedCategory] = useState('보유 종목');

  const categories = ['보유 종목', '주문 내역', '관심 종목'];

  const renderContent = () => {
    if (selectedCategory === '보유 종목') {
      return <Balance />;
    } else if (selectedCategory === '주문 내역') {
      return <History isMyPage={isMyPage} />;
    } else if (selectedCategory === '관심 종목') {
      return <Favorites />;
    }
  };

  return (
    <div className={styles.container}>
      <div className="categoryTabs">
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
      <div className={styles.content} style={contentStyle}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Account;
