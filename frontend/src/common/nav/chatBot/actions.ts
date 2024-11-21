import axios from "axios";

const baseURL = import.meta.env.VITE_LOCAL_BASEURL;

export const postMessage = async (message: string, loginToken: string) => {
  try {
    const bodyData = {
      message: message
    }

    const res = await axios.post(baseURL + "chatbot/", bodyData, {
      headers: {
        Authorization: `Token ${loginToken}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log("서버 오류:", error);
    return "죄송합니다. 서버와 연결되지 않았습니다.";
  }
};
