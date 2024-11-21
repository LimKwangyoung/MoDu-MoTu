import { useState, useEffect } from "react";
import axios from "axios";

const BASEURL = import.meta.env.VITE_LOCAL_BASEURL;

const useFetch = <T>(url: string) => {
  const [data, setData] = useState<null | T>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(BASEURL + url);
        setData(res.data);
      } catch (error) {
        setError(error as Error);
        // console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
