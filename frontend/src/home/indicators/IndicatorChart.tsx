import { Line } from 'react-chartjs-2';
import { IIndicatorCardProps } from './definitions';
import { useIndexStore } from '../../store/useIndexStore';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { IIndexEntry } from '../../store/definitions';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const IndicatorChart = ({ indexTypeId, index, color }: IIndicatorCardProps) => {
  const { indexData } = useIndexStore();

  const indexTypes = ['국내', '해외', '환율', '원자재'] as const;
  const indexList = (indexData![indexTypes[indexTypeId]] as Record<string, IIndexEntry[] | null>)[
    index
  ]!.slice(0, 100);

  const indexValues = indexList.map((item) =>
    item.bstp_nmix_prpr ? item.bstp_nmix_prpr : item.ovrs_nmix_prpr
  );

  const data = {
    labels: indexValues.map((_, i) => i),
    datasets: [
      {
        data: indexValues,
        borderColor: color,
        backgroundColor: '#2b2b2b',
        borderWidth: 1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default IndicatorChart;
