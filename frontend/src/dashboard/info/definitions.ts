export interface ICompanyData {
  market: string;
  industry: string;
  companyDetailsLink: string;
  ceo: string;
  marketCap: number;
  description: string;
}

export interface NewsItem {
  hts_pbnt_titl_cntt: string; // 공시 제목 내용
  dorg: string; // 자료원
  data_dt: string; // 일자
}

// 필요시에는 뉴스랑 공시 분리할 것
export interface ICompanyNewsDisclosure {
  stockCode: string; // 주식 코드
  news?: NewsItem[]; // 뉴스 항목 배열
}
