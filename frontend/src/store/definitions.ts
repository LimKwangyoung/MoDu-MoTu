// type of Index
export interface IIndexEntry {
  stck_bsop_date: string;
  bstp_nmix_prpr?: string;
  bstp_nmix_oprc?: string;
  bstp_nmix_hgpr?: string;
  bstp_nmix_lwpr?: string;
  ovrs_nmix_prpr?: string;
  ovrs_nmix_oprc?: string;
  ovrs_nmix_hgpr?: string;
  ovrs_nmix_lwpr?: string;
  acml_vol: string;
  acml_tr_pbmn: string;
  mod_yn: string;
}

export interface IIndexData {
  국내: {
    코스피: IIndexEntry[] | null;
    코스닥: IIndexEntry[] | null;
  };
  해외: {
    다우존스: IIndexEntry[] | null;
    나스닥: IIndexEntry[] | null;
  };
  환율: {
    '원/달러': IIndexEntry[] | null;
    '엔/달러': IIndexEntry[] | null;
  };
  원자재: {
    WTI: IIndexEntry[] | null;
    금: IIndexEntry[] | null;
  };
}

export interface IIndexState {
  indexData: IIndexData | null;
  fetchIndexData: () => Promise<void>;
}

// type of Balance
export interface IHolding {
  stock_code: string;
  total_amount: number;
  average_price: number;
  stock_name: string;
  current_price: string;
  difference: string;
  percentage: string;
}

export interface IBalanceData {
  holdings: IHolding[];
  balance: number;
}

export interface IBalanceState {
  balanceData: IBalanceData | null;
  getLoginToken: () => string;
  fetchBalanceData: () => Promise<void>;
}

// type of History
export interface IStandardHistoryData {
  odno: string; // 주문번호
  pdno: string; // 종목코드
  prdt_name: string; // 종목명
  sll_buy_dvsn_cd: string; // 구매/판매
  ord_dt: string; // 주문일자
  ord_tmd: string; // 주문시간
  ord_qty: number; // 주문수량
  tot_ccld_qty: number; // 총체결수량
  cncl_cfrm_qty: number; // 취소확인수량
  rmn_qty: number; // 잔여수량
  ord_unpr: number; // 주문단가
  avg_prvs: number; // 체결평균가
  mode: string; // 모드 (프론트에서 처리)
  originalIndex?: number; // 삭제 로직
}

export interface IStandardHistoryState {
  standardHistoryData: IStandardHistoryData[] | null;
  deleteStandardArray: number[];
  getLoginToken: () => string;
  fetchStandardHistoryData: () => Promise<void>;
  deleteStandardHistoryData: (order_number: string) => Promise<void>;
}

export interface IScheduledHistoryData {
  pdno: string; // 종목코드
  prdt_name: string; // 종목명
  sll_buy_dvsn_cd: string; // 구매/판매
  ord_qty: number; // 주문수량
  ord_unpr: number; // 주문단가
  tar_pr: number; // 감시가격
}

export interface IScheduledHistoryState {
  scheduledHistoryData: IScheduledHistoryData[] | null;
  deleteScheduledArray: number[];
  getLoginToken: () => string;
  fetchScheduledHistoryData: () => Promise<void>;
}

export interface IFavoriteData {
  stock_code: string;
  stock_name: string;
  stock_price: string;
  fluctuation_rate: string;
  fluctuation_difference: string;
}

export interface IFavoriteState {
  favoriteData: IFavoriteData[] | null;
  getLoginToken: () => string;
  fetchFavoriteData: () => Promise<void>;
  postFavoriteData: (stockCode: string) => Promise<void>;
  deleteFavoriteData: (stockCode: string) => Promise<void>;
}

// type of Past Stock
export interface IStockData {
  stck_bsop_date: string;
  stck_clpr: string;
  stck_oprc: string;
  stck_hgpr: string;
  stck_lwpr: string;
  acml_vol: string;
  acml_tr_pbmn: string;
  flng_cls_code: string;
  prtt_rate: string;
  mod_yn: string;
  prdy_vrss_sign: string;
  prdy_vrss: string;
  revl_issu_reas: string;
}

export interface IPastStockState {
  dailyPastStockData: IStockData[] | null;
  pastStockData: IStockData[] | null;
  yesterdayStockData: string | null;
  fetchDailyPastStockData: (arg0: string) => Promise<void>;
  fetchPastStockData: (arg0: string, arg1: string) => Promise<void>;
  fetchYesterdayStockData: () => void;
  clearDailyPastStockData: () => void;
  clearPastStockData: () => void;
  clearYesterdayStockData: () => void;
}

// type of Minute Stock
export interface IMinuteStockData {
  stck_bsop_date: string;
  stck_cntg_hour: string;
  stck_prpr: string;
  stck_oprc: string;
  stck_hgpr: string;
  stck_lwpr: string;
  cntg_vol: string;
  acml_tr_pbmn: string;
}

export interface IMinuteStockState {
  minuteStockData: IMinuteStockData[] | null;
  fetchMinuteStockData: (arg0: string) => Promise<void>;
}

// type of Websocket
export interface IIndicatorData {
  prpr_nmix: string;
}

export interface IOrderBookData {
  ASKP1: string; // 매도호가 1
  ASKP2: string; // 매도호가 2
  ASKP3: string; // 매도호가 3
  ASKP4: string; // 매도호가 4
  ASKP5: string; // 매도호가 5
  ASKP6: string; // 매도호가 6
  ASKP7: string; // 매도호가 7
  ASKP8: string; // 매도호가 8
  ASKP9: string; // 매도호가 9
  ASKP10: string; // 매도호가 10
  BIDP1: string; // 매수호가 1
  BIDP2: string; // 매수호가 2
  BIDP3: string; // 매수호가 3
  BIDP4: string; // 매수호가 4
  BIDP5: string; // 매수호가 5
  BIDP6: string; // 매수호가 6
  BIDP7: string; // 매수호가 7
  BIDP8: string; // 매수호가 8
  BIDP9: string; // 매수호가 9
  BIDP10: string; // 매수호가 10
  ASKP_RSQN1: string; // 매도호가 잔량 1
  ASKP_RSQN2: string; // 매도호가 잔량 2
  ASKP_RSQN3: string; // 매도호가 잔량 3
  ASKP_RSQN4: string; // 매도호가 잔량 4
  ASKP_RSQN5: string; // 매도호가 잔량 5
  ASKP_RSQN6: string; // 매도호가 잔량 6
  ASKP_RSQN7: string; // 매도호가 잔량 7
  ASKP_RSQN8: string; // 매도호가 잔량 8
  ASKP_RSQN9: string; // 매도호가 잔량 9
  ASKP_RSQN10: string; // 매도호가 잔량 10
  BIDP_RSQN1: string; // 매수호가 잔량 1
  BIDP_RSQN2: string; // 매수호가 잔량 2
  BIDP_RSQN3: string; // 매수호가 잔량 3
  BIDP_RSQN4: string; // 매수호가 잔량 4
  BIDP_RSQN5: string; // 매수호가 잔량 5
  BIDP_RSQN6: string; // 매수호가 잔량 6
  BIDP_RSQN7: string; // 매수호가 잔량 7
  BIDP_RSQN8: string; // 매수호가 잔량 8
  BIDP_RSQN9: string; // 매수호가 잔량 9
  BIDP_RSQN10: string; // 매수호가 잔량 10
  TOTAL_ASKP_RSQN: string; // 총 매도호가 잔량
  TOTAL_BIDP_RSQN: string; // 총 매수호가 잔량
  [key: string]: string; // 추가하여 동적 키에 대한 타입 허용
}

export interface ITradingData {
  STCK_CNTG_HOUR: number; // 주식 체결 시간
  STCK_PRPR: number; // 주식 현재가
  CNTG_VOL: number; // 체결 거래량
  ACML_VOL: number; // 누적 거래량
  CTTR: number; // 체결강도
  CCLD_DVSN: number; // 체결구분
}

export interface ISocketStore {
  stockCodeData: string | null;
  kospiData: IIndicatorData | null;
  kosdaqData: IIndicatorData | null;
  orderBookData: IOrderBookData | null;
  tradingData: ITradingData | null;

  setStockCodeData: (data: string) => void;
  setKospiData: (data: IIndicatorData) => void;
  setKosdaqData: (data: IIndicatorData) => void;
  setOrderBookData: (data: IOrderBookData) => void;
  setTradingData: (data: ITradingData) => void;
}

import { Layout } from 'react-grid-layout';

export interface IWidgetPositionState {
  widgetPosition: Layout[];
  getLoginToken: () => string;
  fetchWidgetPosition: () => Promise<void>;
  postWidgetPosition: (layout: Layout[]) => Promise<void>;
}

export interface ILoginState {
  loginToken: string;
  login: () => Promise<void>;
}

export interface IDisclosureData {
  hts_pbnt_titl_cntt: string;
  dorg: string;
  data_dt: string;
}

export interface IDisclosureState {
  disclosureData: IDisclosureData[] | null;
  fetchDisclosureData: (stockCode: string) => Promise<void>;
}
