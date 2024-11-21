import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Nav.module.css';

import member from '../../assets/images/member.png';
import chatBot from '../../assets/images/chatBot.png';

import MyPage from './myPage/myPage';
import ChatBot from './chatBot/ChatBot';
import Search from './Search';

const MODAL_COMPONENTS: {
  [key: string]: React.ComponentType<{ closeModal: () => void }>;
} = {
  chatBot: ChatBot,
  myPage: MyPage,
};

const Nav: React.FC = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleOpenModal = (modal: string) => () => setOpenModal(modal); // modal에 string 타입 지정
  const handleCloseModal = () => setOpenModal(null);

  return (
    <>
      {/* Header 영역 */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.modu}>모두</span>모투
        </div>
        <div className={styles.searchContainer}>
          <Search />
        </div>
        <div className={styles.icons}>
          <img
            className={styles.icon1}
            src={chatBot}
            alt="chatBot"
            onClick={handleOpenModal('chatBot')}
          />
          <img
            className={styles.icon3}
            src={member}
            alt="member"
            onClick={handleOpenModal('myPage')}
          />
        </div>
      </header>

      {openModal &&
        React.createElement(MODAL_COMPONENTS[openModal], {
          closeModal: handleCloseModal,
        })}
    </>
  );
};

export default Nav;
