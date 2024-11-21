import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createChart, ISeriesApi, ColorType } from 'lightweight-charts';

import { usePastStockStore } from '../../store/usePastStockStore';
import useSocketStore from '../../store/useSocketStore';

import styles from './Chart.module.css';
import { COLORS } from '../../common/utils';
import { IChartStockData, IChartVolumeData } from './definitions';

const Chart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const histogramSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const { pastStockData, fetchPastStockData } = usePastStockStore();
  const { stockCodeData, tradingData } = useSocketStore();

  const [chartStockData, setChartStockData] = useState<IChartStockData[] | null>(null);
  const [chartVolumeData, setChartVolumeData] = useState<IChartVolumeData[] | null>(null);

  const [selectedPeriodCode, setSelectedPeriodCode] = useState('D');

  const { stockCode } = useParams();

  useEffect(() => {
    setChartStockData(null);
    setChartVolumeData(null);
  }, []);

  useEffect(() => {
    if (!stockCode) return;

    fetchPastStockData(stockCode, selectedPeriodCode);
  }, [selectedPeriodCode]);

  // chartStockData 업데이트
  useEffect(() => {
    if (!pastStockData) return;

    // pastStockData 전처리
    const updatedPastStockData = pastStockData?.map((item) => ({
      time: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(
        4,
        6
      )}-${item.stck_bsop_date.slice(6, 8)}`,
      open: Number(item.stck_oprc),
      close: Number(item.stck_clpr),
      high: Number(item.stck_hgpr),
      low: Number(item.stck_lwpr),
    }));

    setChartStockData(updatedPastStockData);
  }, [pastStockData]);

  // chartVolumeData 업데이트
  useEffect(() => {
    if (!pastStockData) return;

    const updatedPastVolumeData = pastStockData?.map((item, index) => {
      if (index === 0) {
        return {
          time: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(
            4,
            6
          )}-${item.stck_bsop_date.slice(6, 8)}`,
          value: 0,
          color: COLORS.positive,
        };
      }
      return {
        time: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(
          4,
          6
        )}-${item.stck_bsop_date.slice(6, 8)}`,
        value: Number(pastStockData![index].acml_vol),
        color:
          Number(pastStockData![index].acml_vol) >= Number(pastStockData![index - 1].acml_vol)
            ? COLORS.positive
            : COLORS.negative,
      };
    });

    setChartVolumeData(updatedPastVolumeData);
  }, [pastStockData]);

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current || !chartStockData || !chartVolumeData) return;

    const chartOptions = {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { textColor: 'white', background: { type: ColorType.Solid, color: '#252525' } },
      grid: {
        vertLines: { color: 'rgba(105, 105, 105, 0.5)' },
        horzLines: { color: 'rgba(105, 105, 105, 0.5)' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        tickMarkFormatter: (time: string) => {
          const [year, month, day] = time.split('-');
          return `${year}/${month}/${day}`;
        },
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    // 주가 캔들 차트
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: COLORS.positive,
      downColor: COLORS.negative,
      wickUpColor: COLORS.positive,
      wickDownColor: COLORS.negative,
      borderVisible: false,
    });
    candlestickSeries.setData(chartStockData);

    // 거래량 히스토그램 차트
    const histogramSeries = chart.addHistogramSeries({
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
    });
    histogramSeries.setData(chartVolumeData);

    // 참조 저장
    candlestickSeriesRef.current = candlestickSeries;
    histogramSeriesRef.current = histogramSeries;

    chart.timeScale().fitContent();

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartStockData, chartVolumeData]);

  // tradingData 업데이트
  useEffect(() => {
    if (!candlestickSeriesRef.current || !histogramSeriesRef.current || !tradingData || !chartStockData || !chartVolumeData) return;
    if (stockCode !== stockCodeData) return;

    const realtimeStockData = chartStockData[chartStockData.length - 1];
    realtimeStockData.close = Number(tradingData.STCK_PRPR);
    realtimeStockData.high = Math.max(realtimeStockData.high, Number(tradingData.STCK_PRPR));
    realtimeStockData.low = Math.min(realtimeStockData.low, Number(tradingData.STCK_PRPR));
    candlestickSeriesRef.current.update(realtimeStockData);

    const realtimeVolumeData = chartVolumeData[chartVolumeData.length - 1];
    const prevRealtimeVolumeData = chartVolumeData[chartVolumeData.length - 2];
    realtimeVolumeData.value = Number(tradingData.ACML_VOL);
    realtimeVolumeData.color =
      Number(tradingData.ACML_VOL) >= prevRealtimeVolumeData.value
        ? COLORS.positive
        : COLORS.negative;
    histogramSeriesRef.current.update(realtimeVolumeData);
  }, [stockCode, stockCodeData, tradingData, chartStockData, chartVolumeData]);

  return (
    <>
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: '90%', marginTop: '3%' }}
        onMouseDown={(event) => {
          event.stopPropagation(); // 클릭 시 드래그 방지
        }}
      >
        <div className={styles.buttonContainer}>
          {['D', 'M', 'Y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriodCode(period)}
              className={`${selectedPeriodCode === period ? styles.active : ''}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Chart;
