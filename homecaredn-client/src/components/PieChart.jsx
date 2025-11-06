// components/PieChartBase.jsx
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function PieChartBase({ title, year, onYearChange, data, type }) {
  console.log("🔍 Received type:", type);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#333" } },
      title: { display: !!title, text: title },
    },
  };

  // không có type
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

        <Pie data={data} options={options} />
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

        <Pie data={data} options={options} />
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
