import { WebSocketServer } from 'ws';

const socket = new WebSocketServer({ port: 8081 });

function fakeKospiData() {
  const randomValue = (Math.random() * 1000 + 1000).toFixed(2);
  return {
    stock_code: '0001',
    indicator: {
      prpr_nmix: randomValue.toString(),
    },
  };
}

function fakeKosdaqData() {
  const randomValue = (Math.random() * 1000 + 1000).toFixed(2);
  return {
    stock_code: '1001',
    indicator: {
      prpr_nmix: randomValue.toString(),
    },
  };
}

const fakeOrderBookData = () => {
  const randomPrice = () => Math.floor(1000 + Math.random() * 1000).toString();
  const randomVolume = () => Math.floor(Math.random() * 1000).toString();

  return {
    ORDER_BOOK: {
      ASKP1: randomPrice(),
      ASKP2: randomPrice(),
      ASKP3: randomPrice(),
      ASKP4: randomPrice(),
      ASKP5: randomPrice(),
      ASKP6: randomPrice(),
      ASKP7: randomPrice(),
      ASKP8: randomPrice(),
      ASKP9: randomPrice(),
      ASKP10: randomPrice(),
      BIDP1: randomPrice(),
      BIDP2: randomPrice(),
      BIDP3: randomPrice(),
      BIDP4: randomPrice(),
      BIDP5: randomPrice(),
      BIDP6: randomPrice(),
      BIDP7: randomPrice(),
      BIDP8: randomPrice(),
      BIDP9: randomPrice(),
      BIDP10: randomPrice(),
      ASKP_RSQN1: randomVolume(),
      ASKP_RSQN2: randomVolume(),
      ASKP_RSQN3: randomVolume(),
      ASKP_RSQN4: randomVolume(),
      ASKP_RSQN5: randomVolume(),
      ASKP_RSQN6: randomVolume(),
      ASKP_RSQN7: randomVolume(),
      ASKP_RSQN8: randomVolume(),
      ASKP_RSQN9: randomVolume(),
      ASKP_RSQN10: randomVolume(),
      BIDP_RSQN1: randomVolume(),
      BIDP_RSQN2: randomVolume(),
      BIDP_RSQN3: randomVolume(),
      BIDP_RSQN4: randomVolume(),
      BIDP_RSQN5: randomVolume(),
      BIDP_RSQN6: randomVolume(),
      BIDP_RSQN7: randomVolume(),
      BIDP_RSQN8: randomVolume(),
      BIDP_RSQN9: randomVolume(),
      BIDP_RSQN10: randomVolume(),
      TOTAL_ASKP_RSQN: randomVolume() * 10,
      TOTAL_BIDP_RSQN: randomVolume() * 10,
    },
  };
};

const fakeTradingData = () => {
  const now = new Date();
  const formatTime = (date) =>
    `${date.getHours().toString().padStart(2, '0')}${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;

  return {
    trading: {
      STCK_CNTG_HOUR: formatTime(now),
      STCK_PRPR: parseFloat((50000 * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)).toString(),
      CNTG_VOL: Math.floor(Math.random() * 1000).toString(),
      ACML_VOL: Math.floor(100000 + Math.random() * 5000).toString(),
      CTTR: parseFloat((50 + Math.random() * 50).toFixed(2)).toString(),
      CCLD_DVSN: Math.random() < 0.33 ? '1' : Math.random() < 0.66 ? '3' : '5',
    },
  };
};

const sendData = (ws, data) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

const wsConnections = {};
const activeStockCodes = {};

function startBaseInterval() {
  setInterval(() => {
    Object.values(wsConnections).forEach((ws) => {
      sendData(ws, fakeKospiData());
      sendData(ws, fakeKosdaqData());
    });
  }, 5000);
}

socket.on('connection', (ws) => {
  wsConnections[ws] = ws;

  startBaseInterval();

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.stock_code) {
        const stockCode = parsedMessage.stock_code;

        if (!activeStockCodes[stockCode]) {
          activeStockCodes[stockCode] = setInterval(() => {
            const tradingData = { stock_code: stockCode, ...fakeTradingData() };
            const orderBookData = { stock_code: stockCode, ...fakeOrderBookData() };

            sendData(ws, tradingData);
            sendData(ws, orderBookData);
          }, 1000);
        }
      }

      if (parsedMessage.exit && parsedMessage.stock_code) {
        const stockCodeToExit = parsedMessage.stock_code;

        if (activeStockCodes[stockCodeToExit]) {
          clearInterval(activeStockCodes[stockCodeToExit]);
          delete activeStockCodes[stockCodeToExit];
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  ws.on('close', () => {
    delete wsConnections[ws];

    Object.keys(activeStockCodes).forEach((stockCode) => {
      clearInterval(activeStockCodes[stockCode]);
      delete activeStockCodes[stockCode];
    });
  });

  ws.on('error', (error) => {
    console.error(error);
  });
});
