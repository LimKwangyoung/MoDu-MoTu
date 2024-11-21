import { useMemo } from "react";
import { usePastStockStore } from "../../store/usePastStockStore";

// 호가 가격 단위 계산 함수
const getTickSize = (price: number) => {
  if (price < 2000) return 1;
  if (price < 5000) return 5;
  if (price < 20000) return 10;
  if (price < 50000) return 50;
  if (price < 200000) return 100;
  if (price < 500000) return 500;
  return 1000;
};

const useStockLimit = () => {
  const { yesterdayStockData } = usePastStockStore();

  // stockData의 마지막 데이터에서 전일 종가를 사용하여 상한가와 하한가 계산
  const { maxAskPrice, minBidPrice } = useMemo(() => {
    if (!yesterdayStockData) {
      return { maxAskPrice: 0, minBidPrice: 0 };
    }

    const lastClosingPrice = Number(yesterdayStockData); // 전일 종가
    const calculatedUpperLimit = lastClosingPrice * 1.3;
    const calculatedLowerLimit = lastClosingPrice * 0.7;

    // upperLimit와 lowerLimit를 호가 틱 단위로 조정
    const tickSizeUpper = getTickSize(calculatedUpperLimit);
    const tickSizeLower = getTickSize(calculatedLowerLimit);

    const adjustedUpperLimit = Math.floor(calculatedUpperLimit / tickSizeUpper) * tickSizeUpper;
    const adjustedLowerLimit = Math.ceil(calculatedLowerLimit / tickSizeLower) * tickSizeLower;

    return { maxAskPrice: adjustedUpperLimit, minBidPrice: adjustedLowerLimit };
  }, [yesterdayStockData]);

  return { maxAskPrice, minBidPrice };
};

export default useStockLimit;
