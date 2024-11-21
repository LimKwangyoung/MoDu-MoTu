import { create } from "zustand";
import { IMinuteStockState } from "./definitions";
import axios from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const useMinuteStockStore = create<IMinuteStockState>((set) => ({
  minuteStockData: null,

  fetchMinuteStockData: async (stockCode) => {
    try {
      const response = await axios.get(baseURL + "stocks/minute-price/", {
        params: {
          stock_code: stockCode,
        }
      });
      set(() => ({
        minuteStockData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },
}));