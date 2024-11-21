import axios from 'axios';

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

const fetchInformation = async (stockCode: string) => {
  try {
    const response = await axios.get(BASEURL + 'stocks/information/', {
      params: {
        stock_code: stockCode,
      }
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default fetchInformation;
