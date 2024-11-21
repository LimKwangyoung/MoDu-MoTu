import { create } from "zustand";
import { IIndexEntry, IIndexState } from "./definitions";
import axios from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const useIndexStore = create<IIndexState>((set) => ({
  indexData: null,

  fetchIndexData: async () => {
    try {
      const [kospiResponse, kosdaqResponse, nasdaqResponse, djiResponse, yendollarResponse, wondollarResponse, wtiResponse, goldResponse] = await Promise.all([
        axios.get(baseURL + "stocks/kospi/"),
        axios.get(baseURL + "stocks/kosdaq/"),
        axios.get(baseURL + "stocks/nasdaq/"),
        axios.get(baseURL + "stocks/dji/"),
        axios.get(baseURL + "stocks/yen-dollar/"),
        axios.get(baseURL + "stocks/won-dollar/"),
        axios.get(baseURL + "stocks/wti/"),
        axios.get(baseURL + "stocks/gold/"),
      ]);

      const filteredNasdaqData = nasdaqResponse.data.reduce((acc: Record<string, IIndexEntry>, item: IIndexEntry) => {
        acc[item.stck_bsop_date] = item;
        return acc;
      }, {});
      const uniqueNasdaqData: IIndexEntry[] = Object.values(filteredNasdaqData);
      const indexData = {
        "국내": {
          "코스피": kospiResponse.data,
          "코스닥": kosdaqResponse.data,
        },
        "해외": {
          "다우존스": djiResponse.data,
          "나스닥": uniqueNasdaqData,
        },
        "환율": {
          "원/달러": wondollarResponse.data,
          "엔/달러": yendollarResponse.data,
        },
        "원자재": {
          "WTI": wtiResponse.data,
          "금": goldResponse.data,
        },
      };

      set(() => ({ indexData }));
    } catch (error) {
      console.error(error);
    }
  },
}));