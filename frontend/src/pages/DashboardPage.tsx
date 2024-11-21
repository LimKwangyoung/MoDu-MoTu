// To. ALL
// 위젯 내부에 클릭해야되는 버튼 있는 경우,
// 해당 버튼에 onMouseDown 이벤트나 onClick 이벤트 발생 시
// stopPropagation이랑 setIsDraggable 설정해주세요.
// setIsDraggable은 props로 받으시면 됩니다.
// 위젯 prop 인터페이스는 common에 있습니다.

// To. 선재누나
// 추가하기 버튼 위치 임의로 넣어놨는데 바꿔주세요!
// alert창 CSS 부탁드립니다.
// userSelect: 'none' 꼭 넣어야 합니다!! 텍스트 선택 방지 목적입니다. (Ctrl+f로 찾아보시면 딱 하나 있습니다.)

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GridLayout, { Layout } from 'react-grid-layout';

// 위젯 임포트
import Chart from '../dashboard/chart/Chart';
import Info from '../dashboard/info/Info';
import OrderBook from '../dashboard/orderBook/OrderBook';
import Symbol from '../dashboard/symbol/Symbol';
import Trading from '../dashboard/trading/Trading';
import TradingTrend from '../dashboard/tradingTrend/TradingTrend';
import TradingVolume from '../dashboard/tradingVolume/TradingVolume';

// 훅 임포트
import useWindowSize from './hooks/useWindowSize';
import { usePastStockStore } from '../store/usePastStockStore';
import { useMinuteStockStore } from '../store/useMinuteStockStore';
import { useIndexStore } from '../store/useIndexStore';
import { sendMessage } from '../store/useSocketStore';
import { useDisclosure } from '../store/useDisclosure';

// 인터페이스 임포트
import { IWidgetComponentProps } from '../common/definitions';

// 디자인
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from './DashboardPage.module.css';
import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai"; // X / 체크 아이콘
import { useWidgetPositionStore } from '../store/useWidgetPositionStore';

const DashboardPage = () => {
  const { widgetPosition, fetchWidgetPosition, postWidgetPosition } = useWidgetPositionStore();
  const {
    dailyPastStockData,
    pastStockData,
    fetchDailyPastStockData,
    fetchPastStockData,
    fetchYesterdayStockData,
    clearDailyPastStockData,
    clearPastStockData,
    clearYesterdayStockData,
  } = usePastStockStore();
  const { minuteStockData, fetchMinuteStockData } = useMinuteStockStore();
  const { indexData } = useIndexStore();
  const { fetchDisclosureData } = useDisclosure();

  const { stockCode } = useParams();

  useEffect(() => {
    if (!stockCode) return;

    fetchDailyPastStockData(stockCode);
    fetchPastStockData(stockCode, 'M');
    fetchMinuteStockData(stockCode);
    fetchDisclosureData(stockCode);

    // 웹 소켓 종목코드 전송
    sendMessage({ stock_code: stockCode });

    return () => {
      clearDailyPastStockData();
      clearPastStockData();
      clearYesterdayStockData();

      sendMessage({
        stock_code: stockCode,
        exit: 'True',
      });
    };
  }, [stockCode]);

  useEffect(() => {
    if (dailyPastStockData) {
      fetchYesterdayStockData();
    }
  }, [dailyPastStockData]);

  const { width, height } = useWindowSize(); // 윈도우 크기 가져오기

  const [layout, setLayout] = useState<Layout[]>([]); // 위젯 레이아웃 상태
  const [forceRerenderKey, setForceRerenderKey] = useState(0); // 강제 리렌더링을 위한 key
  const [isWidgetVisible, setIsWidgetVisible] = useState<{ [key: string]: boolean }>({});

  // 저장된 위젯 위치 불러오기
  useEffect(() => {
    fetchWidgetPosition();
  }, []);

  // 저장된 위젯 위치 불러온 후에 화면에 적용
  useEffect(() => {
    if (widgetPosition) {
      setLayout(widgetPosition);
      const visibility = widgetPosition.reduce((acc, item) => {
        acc[item.i] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setIsWidgetVisible(visibility);
    }
  }, [widgetPosition]);

  // const [selectedWidgets, setSelectedWidgets] = useState<{ [key: string]: boolean }>(
  //   Object.keys(widgetComponents).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  // );

  // 각 위젯의 가시성 상태
  const [showModal, setShowModal] = useState(false); // 모달 창 표시 여부
  const [isDraggable, setIsDraggable] = useState(true); // 드래그 가능 여부를 상태로 관리

  const maxRows = 16;
  const maxCols = 12;

  // 드래그 종료 시 & 크기 조정 완료 시 호출되는 함수
  const handleLayoutChange = (layout: Layout[], oldItem: Layout, newItem: Layout) => {
    // 모든 아이템을 순회하며, 각 item의 y + h가 maxRows를 초과하는지 확인
    const exceedsMaxRows = layout.some((item) => item.y + item.h > maxRows);

    // maxRows를 초과하면 드래그 제한
    if (exceedsMaxRows) {
      // 이전 위치로 복원
      setLayout((prevLayout) =>
        prevLayout.map((item) =>
          item.i === newItem.i
            ? { ...item, x: oldItem.x, y: oldItem.y } // 원래 위치로 복원
            : item
        )
      );

      // 강제 리렌더링을 위해 key 값 업데이트
      setForceRerenderKey((prevKey) => prevKey + 1);
    } else {
      setLayout(layout); // 문제 없으면 위치를 업데이트
    }
  };

  // 위젯 위치 저장 함수
  const saveLayout = () => {
    postWidgetPosition(layout);
    setForceRerenderKey(prevKey => prevKey + 1);
  };

  // 모달 창 토글 함수
  const toggleModal = () => setShowModal(!showModal);

  // 위젯 추가 시, 추가할 공간 찾는 함수
  const findNewPos = (): [number, number] => {
    // 2D 배열 초기화
    const arr: number[][] = Array.from({ length: maxRows }, () => Array(maxCols).fill(0));
    // layout에 따라 arr 채우기
    for (const item of layout) {
      for (let t = item.y; t < item.y + item.h; t++) {
        for (let i = item.x; i < item.x + item.w; i++) {
          arr[t][i] = 1;
        }
      }
    }
    // toAdd의 새로운 위치 찾기
    for (let y = 0; y < maxRows - 4; y++) {
      for (let x = 0; x < maxCols - 2; x++) {
        let flag = true;
        for (let t = 0; t < 5; t++) {
          if (arr[y + t].slice(x, x + 3).some((value) => value !== 0)) {
            flag = false;
            break;
          }
        }
        if (flag) {
          return [x, y];
        }
      }
    }
    return [-1, -1];
  };

  // 위젯을 추가하는 함수
  const handleAddWidget = (widgetId: string) => {
    if (!isWidgetVisible[widgetId]) {
      const newPos = findNewPos();
      // 만약 newPos[0] == -1이거나 newPos[1] == -1이면
      if (newPos[0] === -1 || newPos[1] === -1) {
        alert('위젯을 추가할 수 없습니다.');
      } else {
        // 아니면 위젯 가시성 상태 업데이트
        setIsWidgetVisible((prev) => ({ ...prev, [widgetId]: true }));
        // 그리고 새 위치에 위젯 추가
        setLayout((prev) => [...prev, { i: widgetId, x: newPos[0], y: newPos[1], w: 3, h: 5 }]);
      }
      // 강제 리렌더링을 위해 key 값 업데이트
      setForceRerenderKey((prevKey) => prevKey + 1);
      toggleModal();
    }
  };

  // 위젯을 숨기는 함수
  const handleRemoveWidget = (widgetId: string) => {
    // 위젯 가시성 상태 업데이트
    setIsWidgetVisible((prev) => ({ ...prev, [widgetId]: false }));
    // 레이아웃에서 위젯 제거
    setLayout((prev) => prev.filter((item) => item.i !== widgetId));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    // setSelectedWidgets((prev) => ({
    //   ...prev,
    //   [widgetId]: !prev[widgetId]
    // }));

    if (isWidgetVisible[widgetId]) {
      handleRemoveWidget(widgetId);
    } else {
      handleAddWidget(widgetId);
    }
  };

  if (!pastStockData || !minuteStockData || !indexData) return <div />;

  // 위젯 구성 객체 (이름, 컴포넌트, 순서 정보 포함)
  const widgetConfig: {
    id: string;
    name: string;
    component: React.ComponentType<IWidgetComponentProps>;
  }[] = [
      { id: 'symbolWidget', name: '개요', component: Symbol },
      { id: 'chartWidget', name: '차트', component: Chart },
      { id: 'orderBookWidget', name: '호가', component: OrderBook },
      { id: 'tradingVolumeWidget', name: '거래량', component: TradingVolume },
      { id: 'tradingWidget', name: '주문', component: Trading },
      {
        id: 'infoWidget',
        name: '기업정보/뉴스/공시',
        component: Info, // stockCode 전달
      },
      { id: 'tradingTrendWidget', name: '거래동향/거래원/투자자', component: TradingTrend },
    ];

  return (
    <div className={styles.container}>
      <div className={styles.addButton}>
        <button onClick={toggleModal} className={styles.addBtn} style={{ marginRight: 5 }}>
          화면 편집
          <span style={{ fontSize: '10px', marginLeft: '5px' }}>▼</span>
        </button>
        <button onClick={saveLayout} className={styles.saveBtn}>
          저장
          {/* <span style={{ fontSize: "10px", marginLeft: "5px" }}></span> */}
        </button>
      </div>

      <div className={styles.main}>
        <div>
          {/* 모달 창 */}
          {showModal && (
            <div className={styles.modalOverlay} onClick={toggleModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className="closeButton" onClick={toggleModal}>
                  <AiOutlineClose size={20} style={{ fill: 'grey' }} />
                </button>
                {/* <h3 className={styles.modalTitle}>위젯 추가/숨김</h3> */}
                {/* 위젯 리스트: 각 위젯의 가시성 여부에 따라 추가 또는 숨김 버튼 표시 */}
                <ul className={styles.widgetList}>
                  {widgetConfig.map(({ id, name }) => (
                    <li
                      key={id}
                      className={`${styles.widgetItem} ${isWidgetVisible[id]
                          ? styles.widgetItemSelected
                          : styles.widgetItemUnselected
                        }`}
                      onClick={() => toggleWidgetVisibility(id)}
                    >
                      <AiOutlineCheck
                        className={styles.checkIcon}
                        size={20}
                        style={{ fill: isWidgetVisible[id] ? '#B469FF' : '#686868' }}
                      />
                      {name}
                    </li>
                  ))}
                </ul>
                {/* <button
                  onClick={toggleModal}
                  style={{ color: 'black', }}
                >
                  닫기
                </button> */}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* 그리드 레이아웃 */}
          <GridLayout
            key={forceRerenderKey} // 강제 리렌더링을 위해 key 사용
            className="layout"
            layout={layout}
            cols={maxCols}
            maxRows={maxRows}
            rowHeight={Math.floor(height / 28)}
            width={width - 35}
            isDraggable={isDraggable} // 상태에 따라 드래그 가능 여부 제어
            isResizable={true}
            resizeHandles={['se']}
            autoSize={true}
            // onLayoutChange={(layout) => console.log(layout)}
            onDragStop={handleLayoutChange} // 드래그 종료 시 커스텀 로직 적용
            onResizeStop={handleLayoutChange} // 크기 조정 완료 시 커스텀 로직 적용
            useCSSTransforms={true}
          >
            {/* 가시성 상태에 따라 위젯을 조건부로 렌더링 */}
            {widgetConfig.map(
              ({ id, component: Component }) =>
                isWidgetVisible[id] && (
                  <div key={id} className={styles.widget}>
                    {/* X 버튼 및 동적 위젯 컴포넌트 렌더링 */}
                    <button
                      className="closeButton"
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        setIsDraggable(false);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveWidget(id);
                        setIsDraggable(true);
                      }}
                    >
                      <AiOutlineClose size={15} style={{ fill: 'grey' }} />
                    </button>
                    <Component setIsDraggable={setIsDraggable} />
                  </div>
                )
            )}
          </GridLayout>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
