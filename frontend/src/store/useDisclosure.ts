import axios from 'axios';
import { create } from 'zustand';
import { IDisclosureState } from './definitions';

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

export const useDisclosure = create<IDisclosureState>((set) => ({
  disclosureData: null,

  fetchDisclosureData: async (stockCode: string) => {
    try {
      const response = await axios.get(`${BASEURL}stocks/disclosure/`, {
        params: {
          stock_code: stockCode,
        },
      });
      set(() => ({
        disclosureData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },
}));
