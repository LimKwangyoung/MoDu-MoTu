import axios from 'axios';

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

const fetchTraderTrend = async (keyword: string, stockCode: string) => {
  try {
    const response = await axios.get(BASEURL + `stocks/trend/${keyword}`, {
      params: {
        stock_code: stockCode,
      }
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default fetchTraderTrend;
