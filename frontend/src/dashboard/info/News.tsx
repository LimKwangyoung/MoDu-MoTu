// 뉴스
import { useDisclosure } from '../../store/useDisclosure';
import { ICompanyNewsDisclosure } from './definitions';
import Item from './Item';
import styles from './Info.module.css';

const News: React.FC<ICompanyNewsDisclosure> = () => {
  const { disclosureData } = useDisclosure();

  return (
    <div className={styles.subContent}>
      {disclosureData ? (
        <div className={styles.newsContainer}>
          {disclosureData.map((news, idx) => (
            <div className={styles.newsItem} key={idx}>
              <Item
                hts_pbnt_titl_cntt={news.hts_pbnt_titl_cntt}
                dorg={news.dorg}
                data_dt={news.data_dt}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default News;
