import { create } from "zustand";
import { IPastStockState } from "./definitions";
import axios from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const usePastStockStore = create<IPastStockState>((set, get) => ({
  dailyPastStockData: null,
  pastStockData: null,
  yesterdayStockData: null,

  fetchDailyPastStockData: async (stockCode) => {
    try {
      const response = await axios.get(baseURL + "stocks/stock-price/", {
        params: {
          stock_code: stockCode,
          period_code: "D",
        }
      });
      set(() => ({
        dailyPastStockData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },

  fetchPastStockData: async (stockCode, periodCode) => {
    try {
      const response = await axios.get(baseURL + "stocks/stock-price/", {
        params: {
          stock_code: stockCode,
          period_code: periodCode,
        }
      });
      set(() => ({
        pastStockData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },

  fetchYesterdayStockData: () => {
    const { dailyPastStockData } = get();

    if (dailyPastStockData) {
      set(() => ({
        yesterdayStockData: dailyPastStockData[dailyPastStockData.length - 2].stck_clpr,
      }));
    }
  },

  clearDailyPastStockData: () => {
    set(() => ({
      dailyPastStockData: null,
    }))
  },

  clearPastStockData: () => {
    set(() => ({
      pastStockData: null,
    }))
  },

  clearYesterdayStockData: () => {
    set(() => ({
      yesterdayStockData: null,
    }))
  },
}));