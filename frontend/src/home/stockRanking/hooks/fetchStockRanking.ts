import axios from 'axios';

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

const fetchStockRanking = async (keyword: string) => {
  try {
    const response = await axios.get(`${BASEURL}stocks/${keyword}-ranking/`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export default fetchStockRanking;
