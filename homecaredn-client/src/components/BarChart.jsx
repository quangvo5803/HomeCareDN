import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PropTypes from "prop-types";
import LoadingComponent from '../components/LoadingComponent';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ title, data, year, onYearChange, type, loading }) {

  const { t } = useTranslation();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#333" },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#666" },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: "#666" },
      },
    },
  };

  const hasData = !!(
    data?.datasets?.some(
      ds => Array.isArray(ds.data) && ds.data.some(v => v !== 0)
    )
  );

  if (type === "Admin") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 dark:bg-slate-850">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-xl capitalize dark:text-white">
            {title}
          </h6>

          {onYearChange && (
            <select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-slate-800 dark:text-white"
              value={year}
              onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
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

        <div className="relative w-full h-[400px]">
          <Bar data={data} options={options} />

          {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl">
              <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 italic">{t('adminDashboard.noData')}</p>
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

  if (type === "Contractor") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 dark:bg-slate-850">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-xl capitalize dark:text-white">
            {title}
          </h6>

          {onYearChange && (
            <select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-slate-800 dark:text-white"
              value={year}
              onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
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

        <div className="relative w-full h-[450px]">
          <Bar data={data} options={options} />

          {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl">
              <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 italic">{t('adminDashboard.noData')}</p>
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

}
BarChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  year: PropTypes.number.isRequired,
  onYearChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  loading: PropTypes.bool,
};