import axios from 'axios';
import { create } from 'zustand';
import { IFavoriteState } from './definitions';
import { useLoginStore } from './useLoginStore';

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const useFavoriteStore = create<IFavoriteState>((set, get) => ({
  favoriteData: null,

  getLoginToken: () => useLoginStore.getState().loginToken,

  fetchFavoriteData: async () => {
    const loginToken = get().getLoginToken();

    try {
      const response = await axios.get(`${baseURL}accounts/favorite-stock/`, {
        headers: {
          Authorization: `Token ${loginToken}`,
        },
      });
      set(() => ({
        favoriteData: response.data,
      }));
    } catch (error) {
      console.log(error);
    }
  },

  postFavoriteData: async (stockCode: string) => {
    const loginToken = get().getLoginToken();

    try {
      const response = await axios.post(
        `${baseURL}accounts/favorite-stock/`,
        { stock_code: stockCode },
        {
          headers: {
            Authorization: `Token ${loginToken}`,
          },
        }
      );
      console.log('Success :', response.data);
    } catch (error) {
      console.log(error);
    }
  },

  deleteFavoriteData: async (stockCode: string) => {
    const loginToken = get().getLoginToken();

    try {
      const response = await axios.delete(`${baseURL}accounts/favorite-stock/`, {
        headers: {
          Authorization: `Token ${loginToken}`,
        },
        data: {
          stock_code: stockCode,
        },
      });

      console.log('Success :', response.data);
    } catch (error) {
      console.log(error);
    }
  },
}));
