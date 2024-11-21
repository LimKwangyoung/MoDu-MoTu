import { useParams } from "react-router-dom";
import styles from "./Info.module.css";

const Overview = () => {
  const { stockCode } = useParams();

  let data;
  if (stockCode === "000660") {
    data = {
      market: 'KOSPI',
      industry: '전기전자',
      companyDetailsLink: '기업분석 자세히 보기',
      ceo: '곽노정',
      marketCap: 1249980,
      description:
        'SK그룹 계열의 종합 반도체 회사로서 DRAM, NAND Flash, CIS 등의 메모리 반도체 제품을 주력으로 제조 및 판매. ' +
        '주요 고객사로는 글로벌 IT 기업들이 있으며, 4차 산업혁명과 AI, 데이터센터 확대 등으로 수요가 증가하는 시장에서 ' +
        '세계적인 반도체 기술력과 품질로 경쟁력을 갖추고 있음.',
    };
  } else {
    data = {
      market: 'KOSPI',
      industry: '전기전자',
      companyDetailsLink: '기업분석 자세히 보기',
      ceo: '한종희',
      marketCap: 3384867,
      description:
        '한국 및 DX부문 해외 9개 지역총괄과 DS부문 해외 5개 지역총괄, SDC, Harman 등 226개의 종속기업으로 구성된 글로벌 전자기업. ' +
        '세트사업은 TV를 비롯 모니터, 냉장고, 세탁기, 에어컨, 스마트폰, 네트워크시스템, 컴퓨터 등을 생산하는 DX부문이 있음. ' +
        '부품 사업에는 DRAM, NAND Flash, 모바일AP 등의 제품을 생산하고 있는 DS 부문과 스마트폰용 OLED 패널을 생산하고 있는 SDC가 있음.',
    };
  }

  return (
    <div className={styles.subContent}>
      {data ? (
        <div className={styles.overviewContainer}>
          {/* 상단 정보: KOSPI | 전기전자 ... 기업분석 자세히 보기 */}
          <div className={styles.headerSection}>
            <span className={styles.marketInfo}>
              {data.market} | {data.industry}
            </span>
            <span className={styles.detailsLink}>{data.companyDetailsLink}</span>
          </div>

          {/* 중간 정보: 대표이사, 시가총액 */}
          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>대표이사</span>
              <span className={styles.infoValue}>{data.ceo}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>시가총액</span>
              <span className={styles.infoValue}>{data.marketCap.toLocaleString()}억원</span>
            </div>
          </div>

          {/* 설명 */}
          <div className={styles.description}>{data.description}</div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default Overview;
