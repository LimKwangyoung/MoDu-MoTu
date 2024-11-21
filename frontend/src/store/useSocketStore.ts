import { create } from "zustand";
import { ISocketStore, IIndicatorData, IOrderBookData, ITradingData } from "./definitions";

const useSocketStore = create<ISocketStore>((set) => ({
  stockCodeData: null,
  kospiData: null,
  kosdaqData: null,
  orderBookData: null,
  tradingData: null,

  setStockCodeData: (data: string) => set({ stockCodeData: data }),
  setKospiData: (data: IIndicatorData) => set({ kospiData: data }),
  setKosdaqData: (data: IIndicatorData) => set({ kosdaqData: data }),
  setOrderBookData: (data: IOrderBookData) => set({ orderBookData: data }),
  setTradingData: (data: ITradingData) => set({ tradingData: data }),
}));

export default useSocketStore;

const SOCKET_URL = "wss://k11a204.p.ssafy.io/ws/";
// const SOCKET_URL = "ws://localhost:8081";

const ws = new WebSocket(SOCKET_URL);

ws.onopen = () => {
  console.log("WebSocket is opened.")
}

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    // console.log(data);

    // kospi
    if (data.stock_code === "0001") {
      useSocketStore.getState().setStockCodeData(data.stock_code);
      useSocketStore.getState().setKospiData(data.indicator.prpr_nmix);
      // kosdaq
    } else if (data.stock_code === "1001") {
      useSocketStore.getState().setStockCodeData(data.stock_code);
      useSocketStore.getState().setKosdaqData(data.indicator.prpr_nmix);
      // order book
    } else if (data.ORDER_BOOK) {
      useSocketStore.getState().setStockCodeData(data.stock_code);
      useSocketStore.getState().setOrderBookData(data.ORDER_BOOK);
      // trading
    } else if (data.trading) {
      useSocketStore.getState().setStockCodeData(data.stock_code);
      useSocketStore.getState().setTradingData({
        STCK_CNTG_HOUR: Number(data.trading.STCK_CNTG_HOUR),
        STCK_PRPR: Number(data.trading.STCK_PRPR),
        CNTG_VOL: Number(data.trading.CNTG_VOL),
        ACML_VOL: Number(data.trading.ACML_VOL),
        CTTR: Number(data.trading.CTTR),
        CCLD_DVSN: Number(data.trading.CCLD_DVSN),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

ws.onerror = (error) => {
  console.error(error);
};

ws.onclose = () => {
  console.log("WebSocket is closed.");
};

const sendMessage = (message: object) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not opened.");
  }
};

export { sendMessage };