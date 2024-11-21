import axios from 'axios';
import { create } from 'zustand';
import { Layout } from 'react-grid-layout';
import { IWidgetPositionState } from './definitions';
import { useLoginStore } from './useLoginStore';

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

// 초기 레이아웃 설정
const initialLayout: Layout[] = [
  { i: 'chartWidget', x: 0, y: 2, w: 6, h: 8 },
  { i: 'infoWidget', x: 0, y: 10, w: 3, h: 6 },
  { i: 'orderBookWidget', x: 6, y: 0, w: 3, h: 16 },
  { i: 'symbolWidget', x: 0, y: 0, w: 6, h: 2 },
  { i: 'tradingWidget', x: 9, y: 5, w: 3, h: 11 },
  { i: 'tradingTrendWidget', x: 3, y: 10, w: 3, h: 6 },
  { i: 'tradingVolumeWidget', x: 9, y: 0, w: 3, h: 5 },
];

export const useWidgetPositionStore = create<IWidgetPositionState>((set, get) => ({
  widgetPosition: initialLayout,

  getLoginToken: () => useLoginStore.getState().loginToken,

  fetchWidgetPosition: async () => {
    const loginToken = get().getLoginToken();

    try {
      const response = await axios.get(`${baseURL}accounts/position/`, {
        headers: {
          Authorization: `Token ${loginToken}`,
        },
      });

      console.log("fetchWidgetPosition: ", response.data)

      if (response.data && response.data.layout) {
        const frontLayout = response.data.layout.map((item: { widget: string; x: number; y: number; w: number; h: number }) => ({
          i: item.widget,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }));

        set(() => ({
          widgetPosition: frontLayout,
        }));

        console.log(frontLayout);
      }
    } catch (error) {
      console.error(error);
    }
  },

  postWidgetPosition: async (layout: Layout[]) => {
    const loginToken = get().getLoginToken();

    try {
      const backendLayout = layout.map((item) => ({
        widget: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));

      const response = await axios.post(
        `${baseURL}accounts/position/`,
        { layout: backendLayout },
        {
          headers: {
            Authorization: `Token ${loginToken}`,
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  },
}));
