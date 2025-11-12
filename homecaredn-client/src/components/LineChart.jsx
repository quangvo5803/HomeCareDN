import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import PropTypes from 'prop-types';
import LoadingComponent from '../components/LoadingComponent';
import { formatVND } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LineChart({
  title,
  data,
  year,
  onYearChange,
  type,
  loading,
}) {
  const { t } = useTranslation();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#333' },
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.y || 0;
            return `${context.dataset.label}: ${formatVND(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#666' },
        grid: { display: false },
      },
      y: {
        min: 0,
        suggestedMax: data?.datasets?.[0]?.data?.some((v) => v > 0)
          ? undefined
          : 100000,
        ticks: {
          color: '#666',
          callback: (value) => formatVND(value),
          stepSize: undefined,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  const defaultData = {
    labels: new Array(12).fill(''),
    datasets: [
      {
        label: 'No Data',
        data: new Array(12).fill(0),
        borderColor: '#ccc',
        backgroundColor: 'rgba(200,200,200,0.3)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const hasData = !!data?.datasets?.some(
    (ds) => Array.isArray(ds.data) && ds.data.some((v) => v !== 0)
  );

  // cho admin
  if (type === 'Admin') {
    return (
      <div className="border-black/12.5 dark:bg-slate-850 dark:shadow-dark-xl shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
        <div className="border-black/12.5 mb-0 flex items-center justify-between rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0">
          <h6 className="capitalize dark:text-white text-xl">{title}</h6>

          {/* Dropdown chọn năm */}
          {onYearChange && (
            <select
              value={year}
              onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-slate-800 dark:text-white"
            >
              {Array.from({ length: 6 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="flex-auto p-4 h-[450px] relative">
          <Line data={data} options={options} height={200} />

          {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl">
              <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 italic">
                {t('adminDashboard.noData')}
              </p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900/70 z-20 rounded-2xl">
              <LoadingComponent />
            </div>
          )}
        </div>
      </div>
    );
  }

  // cho Contractor
  if (type === 'Contractor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 dark:bg-slate-850 h-full">
        <div className="flex justify-between items-center mb-4">
          <h6 className=" dark:text-white text-xl font-semibold">{title}</h6>

          {onYearChange && (
            <select
              value={year}
              onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
              className="border border-green-400 rounded px-2 py-1 text-sm bg-white"
            >
              {Array.from({ length: 6 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="flex-auto p-4 h-[450px] relative">
          <Line data={data} options={options} height={200} />

          {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl">
              <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 italic">
                {t('adminDashboard.noData')}
              </p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900/70 z-20 rounded-2xl">
              <LoadingComponent />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <h6 className="text-gray-700 mb-2">{title || 'Default Empty Chart'}</h6>
      <Line data={defaultData} options={options} height={200} />
      <p className="text-gray-400 text-xs italic mt-2">
        Invalid or missing type — showing default empty chart.
      </p>
    </div>
  );
}

LineChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  year: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  loading: PropTypes.bool,
};
