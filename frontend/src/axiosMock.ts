import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

const mock = new AxiosMockAdapter(axios);

const BASEURL = 'http://localhost:3000/api/v1/';

// indicators
function fakeIndicatorData() {
  const data = [];
  const start = new Date('2024-01-01');
  const end = new Date(
    new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
  );

  const currentDate = start;
  let previousValue = 1000;

  while (currentDate <= end) {
    const stck_bsop_date = currentDate.toISOString().split('T')[0].replace(/-/g, '');

    const changeFactor = Math.random() * 0.04 - 0.02; // -2% ~ +2% 변동
    const bstp_nmix_prpr = (previousValue * (1 + changeFactor)).toFixed(2);

    data.push({
      stck_bsop_date,
      bstp_nmix_prpr: parseFloat(bstp_nmix_prpr).toString(),
    });

    previousValue = parseFloat(bstp_nmix_prpr);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
}

mock.onGet(BASEURL + 'stocks/kospi/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/kosdaq/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/nasdaq/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/dji/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/yen-dollar/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/won-dollar/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/wti/').reply(200, fakeIndicatorData());
mock.onGet(BASEURL + 'stocks/gold/').reply(200, fakeIndicatorData());

// home-stockRanking
function fakeStockRankingData() {
  const stockNames = ['삼성전자', 'LG전자', '카카오', 'NAVER', '셀트리온', '삼성SDI', '현대모비스'];
  const stockCodeList = ['005930', '066570', '035720', '035420', '068270', '006400', '012330'];

  const data = stockNames.map((name, index) => {
    const mksc_shrn_iscd = stockCodeList[index];
    const stck_prpr = Math.floor(Math.random() * 50000) + 30000;
    const prdy_vrss = Math.floor(Math.random() * 2000) - 1000;
    const prdy_ctrt = ((prdy_vrss / stck_prpr) * 100).toFixed(2);
    const prdy_vrss_sign = prdy_vrss >= 0 ? '5' : '1';

    return {
      hts_kor_isnm: name,
      mksc_shrn_iscd: mksc_shrn_iscd,
      data_rank: (index + 1).toString(),
      stck_prpr: stck_prpr.toString(),
      prdy_vrss: prdy_vrss.toString(),
      prdy_vrss_sign,
      prdy_ctrt,
      acml_vol: (Math.floor(Math.random() * 1000000) + 100000).toString(),
      prdy_vol: (Math.floor(Math.random() * 1000000) + 100000).toString(),
      lstn_stcn: (Math.floor(Math.random() * 5000000) + 1000000).toString(),
      avrg_vol: (Math.floor(Math.random() * 100000) + 10000).toString(),
      n_befr_clpr_vrss_prpr_rate: (Math.random() * 2 - 1).toFixed(2).toString(),
      vol_intr: (Math.random() * 100).toFixed(2),
      vol_tnrt: (Math.random() * 0.5).toFixed(2),
      nday_vol_tnrt: (Math.random() * 0.5).toFixed(2),
      avrg_tr_pbmn: (Math.floor(Math.random() * 100000000) + 10000000).toString(),
      tr_pbmn_tnrt: (Math.random() * 0.5).toFixed(2),
      nday_tr_pbmn_tnrt: (Math.random() * 0.5).toFixed(2),
      acml_tr_pbmn: (Math.floor(Math.random() * 1000000000) + 100000000).toString(),
    };
  });

  return data;
}

mock.onGet(BASEURL + 'stocks/volume-ranking/').reply(200, fakeStockRankingData());
mock.onGet(BASEURL + 'stocks/amount-ranking/').reply(200, fakeStockRankingData());
mock.onGet(BASEURL + 'stocks/advance-ranking/').reply(200, fakeStockRankingData());
mock.onGet(BASEURL + 'stocks/decline-ranking/').reply(200, fakeStockRankingData());

// home-aiNews
mock.onGet(BASEURL + 'ai-news').reply(200, [
  {
    id: 1,
    title: '뉴스 타이틀',
    image: 'https://img.freepik.com/free-photo/high-angle-kids-holding-hands_23-2149548011.jpg',
    author: '기자이름',
    description: '뉴스기사내용입니다.뉴스기사내용입니다.뉴스기사내용입니다.',
  },
  {
    id: 2,
    title: '뉴스 타이틀2',
    image: 'https://img.freepik.com/free-photo/high-angle-kids-holding-hands_23-2149548011.jpg',
    author: '기자이름',
    description: '뉴스기사내용입니다.뉴스기사내용입니다.뉴스기사내용입니다.',
  },
  {
    id: 3,
    title: '뉴스 타이틀3',
    image: 'https://img.freepik.com/free-photo/high-angle-kids-holding-hands_23-2149548011.jpg',
    author: '기자이름',
    description: '뉴스기사내용입니다.뉴스기사내용입니다.뉴스기사내용입니다.',
  },
]);

// home-account-balance
mock.onGet(BASEURL + 'account/balance').reply(200, {
  balance: 1400,
  currentValue: 982859,
  prevValue: 999496,
  holdings: [
    {
      name: '피엔티',
      shares: 19,
      currentValue: 52300,
      prevValue: 71456,
      currentEstimatedValue: 978344,
      prevEstimatedValue: 969617,
    },
    {
      name: '로블록스',
      shares: 0.01563,
      currentValue: 60726,
      prevValue: 59593,
      currentEstimatedValue: 52901,
      prevEstimatedValue: 54035,
    },
    {
      name: '메타',
      shares: 0.004605,
      currentValue: 791579,
      prevValue: 817746,
      currentEstimatedValue: 3614,
      prevEstimatedValue: 3495,
    },
  ],
});

// home-account-history 일반주문
mock.onGet(BASEURL + "stocks/history/standard").reply(200, [
  { // 체결 지정가 매수
    odno: "0001569139", // 주문번호
    pdno: "009150", // 종목코드
    // prdt_name: "삼성전기", // 종목명
    sll_buy_dvsn_cd: "BUY", // 구매/판매
    ord_dt: "20240101", // 주문일자
    ord_tmd: "131438", // 주문시간
    ord_qty: "90", // 주문수량
    tot_ccld_qty: "90", // 총체결수량
    cncl_cfrm_qty: "0", // 취소확인수량
    rmn_qty: "0", // 잔여수량
    ord_unpr: "140000", // 주문단가
    avg_prvs: "140000", // 체결평균가
  },
  { // 체결 시장가 매수
    odno: "0001569140",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "BUY",
    ord_dt: "20240101",
    ord_tmd: "142042",
    ord_qty: "50",
    tot_ccld_qty: "50",
    cncl_cfrm_qty: "0",
    rmn_qty: "0",
    ord_unpr: "0",
    avg_prvs: "150000", // 참고 시장가가 150500일 때 25주, 시장가가 149500일 때 25주 체결되면 평단이 150000임
  },
  { // 체결 지정가 매도
    odno: "0001569141",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "SELL",
    ord_dt: "20240201",
    ord_tmd: "100128",
    ord_qty: "60",
    tot_ccld_qty: "60",
    cncl_cfrm_qty: "0",
    rmn_qty: "0",
    ord_unpr: "170000",
    avg_prvs: "170000",
  },
  { // 체결 시장가 매도
    odno: "0001569142",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "SELL",
    ord_dt: "20240301",
    ord_tmd: "093850",
    ord_qty: "80",
    tot_ccld_qty: "80",
    cncl_cfrm_qty: "0",
    rmn_qty: "0",
    ord_unpr: "0",
    avg_prvs: "160000",
  },
  { // 취소
    odno: "0001569143",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "BUY",
    ord_dt: "20241010",
    ord_tmd: "130303",
    ord_qty: "80",
    tot_ccld_qty: "0",
    cncl_cfrm_qty: "80",
    rmn_qty: "0",
    ord_unpr: "0",
    avg_prvs: "180000",
  },
  { // 미체결
    odno: "0001569144",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "BUY",
    ord_dt: "20241010",
    ord_tmd: "130504",
    ord_qty: "80",
    tot_ccld_qty: "40",
    cncl_cfrm_qty: "0",
    rmn_qty: "40",
    ord_unpr: "0",
    avg_prvs: "180000",
  },
  { // 체결 시장가 매도
    odno: "0001569145",
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "BUY",
    ord_dt: "20241020",
    ord_tmd: "093850",
    ord_qty: "80",
    tot_ccld_qty: "80",
    cncl_cfrm_qty: "0",
    rmn_qty: "0",
    ord_unpr: "0",
    avg_prvs: "160000",
  },
]);

// home-account-history 조건주문
mock.onGet(BASEURL + "stocks/history/scheduled").reply(200, [
  { // 지정가 조건주문
    pdno: "009150", // 종목코드
    // prdt_name: "삼성전기", // 종목명
    sll_buy_dvsn_cd: "SELL", // 구매/판매
    ord_qty: "200", // 주문수량
    ord_unpr: "120000", // 주문단가
    tar_pr: "120000", // 감시가격
  },
  { // 시장가 조건주문
    pdno: "009150",
    // prdt_name: "삼성전기",
    sll_buy_dvsn_cd: "SELL",
    ord_qty: "100",
    ord_unpr: "0",
    tar_pr: "130000",
  },
]);

// home-account-favorites
mock.onGet(BASEURL + 'account/favorite').reply(200, [
  { name: '시보드', currentValue: 4108934, prevValue: 4108934 },
  { name: '삼성전자', currentValue: 56100, prevValue: 56600 },
  { name: '카카오', currentValue: 36550, prevValue: 37450 },
  { name: '테슬라', currentValue: 356583, prevValue: 359592 },
  { name: '쿠팡', currentValue: 35354, prevValue: 35354 },
  { name: '메타', currentValue: 784814, prevValue: 783820 },
  { name: '로블록스', currentValue: 57677, prevValue: 57677 },
  { name: '넷플릭스', currentValue: 1039668, prevValue: 1040648 },
  { name: '애플', currentValue: 316962, prevValue: 314941 },
]);

// dashboard-info-overview
mock.onGet(BASEURL + 'info/005930').reply(200, {
  market: 'KOSPI',
  industry: '전기전자',
  companyDetailsLink: '기업분석 자세히 보기',
  ceo: '한종희',
  marketCap: 3384867,
  description:
    '한국 및 DX부문 해외 9개 지역총괄과 DS부문 해외 5개 지역총괄, SDC, Harman 등 226개의 종속기업으로 구성된 글로벌 전자기업. ' +
    '세트사업은 TV를 비롯 모니터, 냉장고, 세탁기, 에어컨, 스마트폰, 네트워크시스템, 컴퓨터 등을 생산하는 DX부문이 있음. ' +
    '부품 사업에는 DRAM, NAND Flash, 모바일AP 등의 제품을 생산하고 있는 DS 부문과 스마트폰용 OLED 패널을 생산하고 있는 SDC가 있음.',
});

mock.onGet(BASEURL + 'info/000660').reply(200, {
  market: 'KOSPI',
  industry: '전기전자',
  companyDetailsLink: '기업분석 자세히 보기',
  ceo: '곽노정',
  marketCap: 1249980,
  description:
    'SK그룹 계열의 종합 반도체 회사로서 DRAM, NAND Flash, CIS 등의 메모리 반도체 제품을 주력으로 제조 및 판매. ' +
    '주요 고객사로는 글로벌 IT 기업들이 있으며, 4차 산업혁명과 AI, 데이터센터 확대 등으로 수요가 증가하는 시장에서 ' +
    '세계적인 반도체 기술력과 품질로 경쟁력을 갖추고 있음.',
});

// dashboard-info-news
mock.onGet(BASEURL + 'info/1/news').reply(200, [
  {
    id: 1,
    title: '외국인, 34거래일만에 삼성전자 샀다... 3%대 강세',
    created_at: '2024-10-31',
    author: '이데일리',
    url: 'https://www.google.com',
  },
  {
    id: 2,
    title: '오늘의 인기검색 20종목',
    created_at: '2024-10-30',
    author: '인포스탁',
    url: 'https://www.google.com',
  },
  {
    id: 3,
    title: '코스피, 기관, 금투 순매수에 2600 회복',
    created_at: '2024-10-29',
    author: '파이낸셜뉴스',
    url: 'https://www.google.com',
  },
  {
    id: 4,
    title: "인텔, AI PC 위한 '울트라 프로세서'출시 ... 삼성?LG와 AI 생태계 확장",
    created_at: '2024-10-28',
    author: '이투데이',
    url: 'https://www.google.com',
  },
  {
    id: 5,
    title: '외국계 순매수,도 상위종목(코스피) 금액기준',
    created_at: '2024-10-27',
    author: '인포스탁',
    url: 'https://www.google.com',
  },
]);

// dashboard-info-disclosure
mock.onGet(BASEURL + 'info/1/disclosure').reply(200, [
  {
    id: 1,
    title: '삼성전자(주) 기업설명회(IR) 개최(안내공시)',
    created_at: '2024-10-08 08:55:00',
    author: '거래소 공시',
    url: 'https://www.google.com', // 실제 URL로 변경 가능
  },
  {
    id: 2,
    title: '삼성전자(주) 연결재무제표기준영업(잠정)실적(공정공시)',
    created_at: '2024-10-08 08:45',
    author: '거래소 공시',
    url: 'https://www.google.com',
  },
  {
    id: 3,
    title: '삼성전자(주) 주식선물 - 주식옵션 3단계 가격제한폭 확대요건 도달(하락)',
    created_at: '2024-08-05 14:52',
    author: '거래소 공시',
    url: 'https://www.google.com',
  },
  {
    id: 4,
    title: '삼성전자(주) 주식선물 - 주식옵션 2단계 가격제한폭 확대요건 도달(하락)',
    created_at: '2024-08-05 14:47',
    author: '거래소 공시',
    url: 'https://www.google.com',
  },
  {
    id: 5,
    title: '삼성전자(주) 기타 경영사항(자율공시)',
    created_at: '2024-07-31 17:08',
    author: '거래소 공시',
    url: 'https://www.google.com',
  },
]);

// dashboard-chart
function fakeStockData() {
  const data = [];
  const start = new Date('2020-01-01');
  const end = new Date(new Date().toISOString().split('T')[0]);

  let lastClosePrice = 50000;

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const closePrice = Math.max(10000, lastClosePrice + Math.floor(Math.random() * 1000 - 500));
    const openPrice = closePrice + Math.floor(Math.random() * 200 - 100);
    const highPrice = Math.max(openPrice, closePrice) + Math.floor(Math.random() * 200);
    const lowPrice = Math.min(openPrice, closePrice) - Math.floor(Math.random() * 200);
    const dailyVolume = Math.floor(Math.random() * 1000000 + 500000);

    data.push({
      stck_bsop_date: date.toISOString().split('T')[0].replace(/-/g, ''),
      stck_clpr: closePrice.toString(),
      stck_oprc: openPrice.toString(),
      stck_hgpr: highPrice.toString(),
      stck_lwpr: lowPrice.toString(),
      acml_vol: dailyVolume.toString(),
      acml_tr_pbmn: (dailyVolume * closePrice).toString(),
      flng_cls_code: '00',
      prtt_rate: '0.00',
      mod_yn: 'N',
      prdy_vrss_sign: Math.random() > 0.5 ? '1' : '2',
      prdy_vrss: Math.floor(Math.random() * 500).toString(),
      revl_issu_reas: '-',
    });

    lastClosePrice = closePrice;
  }
  return data;
}

mock.onGet(BASEURL + 'stocks/stock-price/').reply(200, fakeStockData());

// dashboard-tradingVolume
function fakeMinuteData() {
  const data = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0].replace(/-/g, '');

  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);

  while (startTime <= now) {
    const hour = startTime.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 6);

    const randomPrice = (base: number) => (base + Math.floor(Math.random() * 100 - 50)).toString();

    const basePrice = 58000;
    const openPrice = randomPrice(basePrice);
    const highPrice = randomPrice(basePrice + 50);
    const lowPrice = randomPrice(basePrice - 50);
    const currentPrice = randomPrice(basePrice);
    const volume = (1000 + Math.floor(Math.random() * 5000)).toString();
    const totalVolume = Math.floor(Math.random() * 1e9).toString();

    data.push({
      stck_bsop_date: today,
      stck_cntg_hour: hour,
      stck_prpr: currentPrice,
      stck_oprc: openPrice,
      stck_hgpr: highPrice,
      stck_lwpr: lowPrice,
      cntg_vol: volume,
      acml_tr_pbmn: totalVolume,
    });

    startTime.setMinutes(startTime.getMinutes() + 1);
  }

  return data;
}

mock.onGet(BASEURL + 'stocks/minute-price/').reply(200, fakeMinuteData());

// dashboard-tradingTrend-daily
const fakeDailyData = () => {
  const data = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    // 일자: 오늘부터 i일 전
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // 가짜 데이터 생성
    const fakeData = {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
      price: Math.round(1000 + Math.random() * 500), // 주가: 1000 ~ 1500 사이 랜덤값
      change: Math.round(-10 + Math.random() * 20), // 대비: -10 ~ 10 사이 랜덤값
      rate: parseFloat((Math.random() * 2 - 1).toFixed(2)), // 등락률: -1.00 ~ 1.00 사이 랜덤값
      volume: Math.floor(10000 + Math.random() * 5000), // 거래량: 10000 ~ 15000 사이 랜덤값
    };

    data.push(fakeData);
  }

  return data;
};

mock.onGet(BASEURL + 'trend/1/daily').reply(200, fakeDailyData());

// dashboad-tradingTrend-trader
mock.onGet(BASEURL + 'trend/1/trader').reply(200, {
  sell: [
    {
      company: '미래에셋',
      amount: 4384406,
      diff: 34364,
    },
    {
      company: '키움증권',
      amount: 3283549,
      diff: 80707,
    },
    {
      company: 'LS증권',
      amount: 2218356,
      diff: 2550,
    },
    {
      company: 'BNK증권',
      amount: 2142288,
      diff: 224,
    },
    {
      company: 'KB증권',
      amount: 2114131,
      diff: 50359,
    },
  ],
  buy: [
    {
      company: '미래에셋',
      amount: 5133436,
      diff: 224364,
    },
    {
      company: 'LS증권',
      amount: 3351748,
      diff: 1865,
    },
    {
      company: 'BNK증권',
      amount: 2171911,
      diff: 25647,
    },
    {
      company: '한국증권',
      amount: 1932250,
      diff: 52928,
    },
    {
      company: '신한증권',
      amount: 1840511,
      diff: 1840511,
    },
  ],
  foreignVolume: [
    {
      sell: 405832,
      buy: 161328,
    },
  ],
});

const fakeInvestorData = () => {
  const data = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    // 일자: 오늘부터 i일 전
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // 가짜 데이터 생성
    const fakeData = {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
      foreigner: Math.round(-10000 + Math.random() * 20000),
      corporate: Math.round(-10000 + Math.random() * 20000),
      individual: Math.round(-10000 + Math.random() * 20000),
    };

    data.push(fakeData);
  }
  return data;
};

// dashboard-tradingTrend-investor
mock.onGet(BASEURL + 'trend/1/investor').reply(200, fakeInvestorData());

mock.onPost(BASEURL + 'chatbot/message').reply(200, { message: '지피티의 답변~~' });

mock.onGet(BASEURL + 'search').reply(200, {
  companyId: 12345,
});

export default mock;

// dashboard-trading-order
mock.onPost(BASEURL + 'stocks/orders/').reply((config) => {
  const orderData = JSON.parse(config.data);
  return [200, { message: "Order placed successfully", orderData }];
});

// dashboard 위젯
mock.onGet(BASEURL + "accounts/position/").reply(200, {
  "layout": [
    { "widget": "chartWidget", "x": 0, "y": 2, "w": 6, "h": 8 },
    { "widget": "infoWidget", "x": 0, "y": 10, "w": 3, "h": 6 },
    { "widget": "orderBookWidget", "x": 6, "y": 0, "w": 3, "h": 16 },
    { "widget": "symbolWidget", "x": 0, "y": 0, "w": 6, "h": 2 },
    { "widget": "tradingWidget", "x": 9, "y": 5, "w": 3, "h": 11 },
    { "widget": "tradingTrendWidget", "x": 3, "y": 10, "w": 3, "h": 6 },
    { "widget": "tradingVolumeWidget", "x": 9, "y": 0, "w": 3, "h": 5 }
  ]
});
