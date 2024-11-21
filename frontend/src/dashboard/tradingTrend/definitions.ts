export interface IItem {
  company: string;
  amount: number;
  diff: number;
}

export interface ITrader {
  [key: string]: number | string;
  seln_mbcr_no1: string;
  seln_mbcr_no2: string;
  seln_mbcr_no3: string;
  seln_mbcr_no4: string;
  seln_mbcr_no5: string;
  seln_mbcr_name1: string;
  seln_mbcr_name2: string;
  seln_mbcr_name3: string;
  seln_mbcr_name4: string;
  seln_mbcr_name5: string;
  total_seln_qty1: string;
  total_seln_qty2: string;
  total_seln_qty3: string;
  total_seln_qty4: string;
  total_seln_qty5: string;
  seln_mbcr_rlim1: string;
  seln_mbcr_rlim2: string;
  seln_mbcr_rlim3: string;
  seln_mbcr_rlim4: string;
  seln_mbcr_rlim5: string;
  seln_qty_icdc1: string;
  seln_qty_icdc2: string;
  seln_qty_icdc3: string;
  seln_qty_icdc4: string;
  seln_qty_icdc5: string;
  shnu_mbcr_no1: string;
  shnu_mbcr_no2: string;
  shnu_mbcr_no3: string;
  shnu_mbcr_no4: string;
  shnu_mbcr_no5: string;
  shnu_mbcr_name1: string;
  shnu_mbcr_name2: string;
  shnu_mbcr_name3: string;
  shnu_mbcr_name4: string;
  shnu_mbcr_name5: string;
  total_shnu_qty1: string;
  total_shnu_qty2: string;
  total_shnu_qty3: string;
  total_shnu_qty4: string;
  total_shnu_qty5: string;
  shnu_mbcr_rlim1: string;
  shnu_mbcr_rlim2: string;
  shnu_mbcr_rlim3: string;
  shnu_mbcr_rlim4: string;
  shnu_mbcr_rlim5: string;
  shnu_qty_icdc1: string;
  shnu_qty_icdc2: string;
  shnu_qty_icdc3: string;
  shnu_qty_icdc4: string;
  shnu_qty_icdc5: string;
  glob_total_seln_qty: string;
  glob_seln_rlim: string;
  glob_ntby_qty: string;
  glob_total_shnu_qty: string;
  glob_shnu_rlim: string;
  seln_mbcr_glob_yn_1: string;
  seln_mbcr_glob_yn_2: string;
  seln_mbcr_glob_yn_3: string;
  seln_mbcr_glob_yn_4: string;
  seln_mbcr_glob_yn_5: string;
  shnu_mbcr_glob_yn_1: string;
  shnu_mbcr_glob_yn_2: string;
  shnu_mbcr_glob_yn_3: string;
  shnu_mbcr_glob_yn_4: string;
  shnu_mbcr_glob_yn_5: string;
  glob_total_seln_qty_icdc: string;
  glob_total_shnu_qty_icdc: string;
}

export interface IInvestor {
  frgn_ntby_qty: string;
  frgn_ntby_tr_pbmn: string;
  orgn_ntby_qty: string;
  orgn_ntby_tr_pbmn: string
  prsn_ntby_qty: string;
  prsn_ntby_tr_pbmn: string;
  stck_bsop_date: string;
}