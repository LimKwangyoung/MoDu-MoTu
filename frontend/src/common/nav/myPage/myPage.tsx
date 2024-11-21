import React from 'react';
import '../modal.css';
import Account from '../../components/account/Account';
import styles from './myPage.module.css';

const MyPage: React.FC<{ closeModal: () => void }> = ({ closeModal }) => (
  <div className="modalOverlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modalCloseButton" onClick={closeModal}>
        &times;
      </button>
      <div className="modalContent">
        <h2 className={styles.header}>마이페이지</h2>
        <div className={styles.content} style={{ transform: 'scale(0.88)' }}>
          <Account contentStyle={{ height: '630px', overflowY: 'scroll' }} isMyPage={true} />
        </div>
      </div>
    </div>
  </div>
);

export default MyPage;
