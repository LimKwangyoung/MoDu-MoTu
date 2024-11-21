import styles from './App.module.css';

import { Routes, Route, useLocation } from 'react-router-dom';

import Nav from './common/nav/Nav';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import MarketPage from './pages/MarketPage';
import Rolling from './common/rolling/Rolling';
import './index.css';

// import './axiosMock';

function App() {
  const location = useLocation();

  return (
    <div id="app" className={styles.mainContainer}>
      <Nav />
      <Routes>
        <Route path="" element={<HomePage />}></Route>
        <Route path="/dashboard/:stockCode" element={<DashboardPage />}></Route>
        <Route path="/market/:indexTypeId" element={<MarketPage />}></Route>
      </Routes>
      {/* HomePage가 아닌 경우에만 Rolling 렌더링 */}
      {location.pathname !== '/' && <Rolling />}
    </div>
  );
}

export default App;
