import axios from "axios";

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

export const fetchSearch = async (q: string) => {
  try {
    const res = await axios.get(BASEURL + "search", {
      params: {
        q,
      },
    });
    if (res.data.companyId) {
      return res.data.companyId;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};
