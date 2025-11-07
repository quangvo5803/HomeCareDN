import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import PropTypes from "prop-types";
import LoadingComponent from '../components/LoadingComponent';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function PieChart({ title, year, onYearChange, data, type, loading }) {
  console.log("🔍 Received type:", type);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "#333" } },
      title: { display: false },
    },
  };

  const defaultData = {
    labels: ["No Data"],
    datasets: [
      {
        label: "Empty",
        data: [1],
        backgroundColor: ["rgba(200,200,200,0.5)"],
        borderColor: ["#ccc"],
        borderWidth: 1,
      },
    ],
  };

  if (type === "Admin") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 dark:bg-slate-850">
        <div className="flex items-center justify-between mb-1">
          <h6 className="text-xl capitalize dark:text-white">{title}</h6>

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

        <div className="relative flex justify-center items-center p-2 h-[430px]">
          <Pie data={data} options={options} />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900/70 z-20 rounded-xl">
              <LoadingComponent />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "Contractor") {
    return (
      <div className="bg-green-50 border border-green-300 rounded-xl p-4 shadow">
        <div className="flex justify-between items-center mb-2">
          <h6 className="text-green-700 font-semibold">{title}</h6>

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

        <div className="relative flex justify-center items-center p-2 h-[430px]">
          <Pie data={data} options={options} />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900/70 z-20 rounded-xl">
              <LoadingComponent />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mặc định
  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <h6 className="text-gray-700 mb-2">{title || "Default Empty Pie"}</h6>
      <Pie data={defaultData} options={options} />
      <p className="text-gray-400 text-xs italic mt-2">
        Invalid or missing type — showing default pie.
      </p>
    </div>
  );
}
PieChart.propTypes = {
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  onYearChange: PropTypes.func,
  data: PropTypes.object.isRequired,
  type: PropTypes.string,
  loading: PropTypes.bool,
};