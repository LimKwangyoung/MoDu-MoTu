import { useEffect, useRef } from "react";

import { useIndexStore } from "../store/useIndexStore";
import { createChart, ColorType, IChartApi } from "lightweight-charts";

import styles from './IndexChart.module.css';
import { COLORS } from "../common/utils";
import { IIndexChartProps, IIndexData } from "./definitions";

const IndexChart = ({ indexType }: IIndexChartProps) => {
  const chartContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { indexData } = useIndexStore();

  useEffect(() => {
    const charts: IChartApi[] = [];

    const chartOptions = {
      layout: { textColor: "white", background: { type: ColorType.Solid, color: "black" } },
      grid: {
        vertLines: { color: "rgba(105, 105, 105, 0.5)" },
        horzLines: { color: "rgba(105, 105, 105, 0.5)" },
      },
      timeScale: {
        tickMarkFormatter: (time: string) => {
          const [year, month, day] = time.split("-");
          return `${year}/${month}/${day}`;
        },
      },
    };

    Object.entries(indexData![indexType as keyof IIndexData] || {}).forEach(([_, data], i) => {
      if (chartContainerRefs.current[i] && data) {
        const chartData = data.map(item => ({
          value: item.bstp_nmix_prpr ? parseFloat(item.bstp_nmix_prpr) : item.ovrs_nmix_prpr ? parseFloat(item.ovrs_nmix_prpr) : 0,
          time: `${item.stck_bsop_date.slice(0, 4)}-${item.stck_bsop_date.slice(4, 6)}-${item.stck_bsop_date.slice(6, 8)}`
        }));

        const chart = createChart(chartContainerRefs.current[i] as HTMLDivElement, chartOptions);

        if (chartData.length > 1) {
          const current = chartData[chartData.length - 1];
          const previous = chartData[chartData.length - 2];
          const changeValue = current.value - previous.value;

          const lineSeries = chart.addLineSeries({
            color: changeValue >= 0 ? COLORS.positive : COLORS.negative
          });

          lineSeries.setData(chartData);
          chart.timeScale().fitContent();

          charts.push(chart);
        }
      }
    });

    return () => {
      charts.forEach((chart) => chart.remove());
    };
  }, [indexType]);

  return (
    <div className={styles.container}>
      {Object.keys(indexData![indexType as keyof IIndexData] || {}).map((key, i) => (
        <div className={styles.graph} key={key}>
          <div className={styles.graphTitle}>{key}</div>
          <div
            className={styles.graphContent}
            ref={(el) => (chartContainerRefs.current[i] = el)}
            style={{ width: "510px", height: `${510 * 0.65}px` }}
          />
        </div>
      ))}
    </div>
  );
};

export default IndexChart;
