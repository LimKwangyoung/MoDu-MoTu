import axios from "axios";
import { create } from "zustand";
import { useLoginStore } from "./useLoginStore";
import { IBalanceState } from "./definitions";

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const useBalanceStore = create<IBalanceState>((set, get) => ({
  balanceData: null,

  getLoginToken: () => useLoginStore.getState().loginToken,

  fetchBalanceData: async () => {
    const loginToken = get().getLoginToken();

    try {
      const response = await axios.get(baseURL + "stocks/holdings/", {
        headers: {
          Authorization: `Token ${loginToken}`,
        },
      });
      set(() => ({
        balanceData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },
}));
