export interface IIndexChartProps {
  indexType: string;
}

export interface IIndexEntry {
  stck_bsop_date: string;
  bstp_nmix_prpr?: string;
  ovrs_nmix_prpr?: string;
  bstp_nmix_oprc: string;
  bstp_nmix_hgpr: string;
  bstp_nmix_lwpr: string;
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
    "원/달러": IIndexEntry[] | null;
    "엔/달러": IIndexEntry[] | null;
  };
  원자재: {
    WTI: IIndexEntry[] | null;
    금: IIndexEntry[] | null;
  };
}
