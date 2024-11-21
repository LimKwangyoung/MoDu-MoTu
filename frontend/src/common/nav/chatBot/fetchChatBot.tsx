import { useState } from "react";
import { postMessage } from "./actions";

const fetchChatBot = (loginToken: string) => {
  const [chat, setChat] = useState([
    {
      message: "안녕하세요! 저는 AI챗봇입니다. 무엇을 도와드릴까요?",
      role: "gpt",
    },
  ]);
  const [newchat, setNewchat] = useState("");
  const [loading, setLoading] = useState(false);

  const sendChat = async (message: string) => {
    if (message.length === 0) return;
    setLoading(true);

    setChat((prevChat) => [...prevChat, { message, role: "me" }]);

    try {
      const response = await postMessage(message, loginToken);
      setChat((prevChat) => [
        ...prevChat,
        { message: response, role: "gpt" },
      ]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setChat((prevChat) => [
        ...prevChat,
        { message: "오류가 발생했습니다. 다시 시도해주세요.", role: "gpt" },
      ]);
    } finally {
      setLoading(false);
      setNewchat("");
    }
  };

  return { chat, sendChat, newchat, setNewchat, loading };
};

export default fetchChatBot;
