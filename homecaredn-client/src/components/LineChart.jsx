// components/LineChartBase.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineChart({ title, data, year, onYearChange, type }) {
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#333" } },
      title: { display: !!title, text: title },
    },
    scales: {
      x: { ticks: { color: "#666" } },
      y: { ticks: { color: "#666" } },
    },
  };


  const defaultData = {
    labels: Array(12).fill(""),
    datasets: [
      {
        label: "No Data",
        data: Array(12).fill(0),
        borderColor: "#ccc",
        backgroundColor: "rgba(200,200,200,0.3)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
    ],
  };
  // cho admin
  if (type === "Admin") {
    return (
      <div className="border-black/12.5 dark:bg-slate-850 dark:shadow-dark-xl shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
        <div className="border-black/12.5 mb-0 flex items-center justify-between rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0">
          <h6 className="capitalize dark:text-white">{title}</h6>

          {/* Dropdown chọn năm */}
          {onYearChange && (
            <select
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
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

        <div className="flex-auto p-4">
          <Line data={data} options={options} height={200} />
        </div>
      </div>
    );
  }

  // cho Contractor
  if (type === "Contractor") {
    return (
      <div className="bg-green-50 border border-green-300 rounded-xl p-4 shadow">
        <div className="flex justify-between items-center mb-2">
          <h6 className="text-green-700 font-semibold">{title}</h6>

          {onYearChange && (
            <select
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
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

        <Line data={data} options={options} height={180} />
      </div>
    );
  }

  // 🔹 Mặc định nếu không có type
  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <h6 className="text-gray-700 mb-2">
        {title || "Default Empty Chart"}
      </h6>
      <Line data={defaultData} options={options} height={200} />
      <p className="text-gray-400 text-xs italic mt-2">
        Invalid or missing type — showing default empty chart.
      </p>
    </div>
  );
}
