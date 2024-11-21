import React, { useEffect, useRef } from "react";
import "../modal.css";
import fetchChatBot from "./fetchChatBot";
import styles from './ChatBot.module.css';
import { useLoginStore } from "../../../store/useLoginStore";

interface ModalComponentProps {
  closeModal: () => void;
}

const ChatBot: React.FC<ModalComponentProps> = ({ closeModal }) => {
  const { loginToken } = useLoginStore();
  const { chat, sendChat, newchat, setNewchat, loading } = fetchChatBot(loginToken);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && newchat.trim()) {
      e.preventDefault();
      sendChat(newchat);
    }
  };

  return (
    <div className="modalOverlay" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modalCloseButton" onClick={closeModal}>
          &times;
        </button>
        <div className="modalContent">
          <h2 className={styles.header}>AI 챗봇</h2>
          <div className={styles.chatContainer} ref={chatContainerRef}>
            {chat.map((c, idx) => (
              <div
                key={idx}
                className={`${styles.chatMessage} ${
                  c.role !== "gpt" ? styles.userMessage : styles.botMessage
                }`}
              >
                <p>{c.message}</p>
              </div>
            ))}
          </div>
          <div className={styles.chatInputContainer}>
            <input
              className={styles.chatInput}
              type="text"
              placeholder="메시지를 입력하세요"
              value={newchat}
              onChange={(e) => setNewchat(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.sendButton}
              onClick={() => sendChat(newchat)}
              disabled={loading || !newchat.trim()}
            >
              {loading ? "답변 생성 중.." : "전송"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
