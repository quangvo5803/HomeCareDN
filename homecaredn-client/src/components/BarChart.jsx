import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần cho BarChart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart() {
  const { t } = useTranslation();
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Revenue",
        data: [12, 19, 3, 5, 2, 3, 15, 22, 30, 25, 40, 50],
        backgroundColor: "rgba(16,185,129,0.6)", // xanh lá
        borderColor: "rgb(16,185,129)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#333",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#666" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#666" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 dark:bg-slate-850">
      <div className="flex items-center justify-between mb-1">
        <h6 className="text-xl capitalize dark:text-white">
          {t("adminDashboard.pieChart.serviceRequests")}
        </h6>

        {/* Dropdown chọn năm */}
        <select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-slate-800 dark:text-white">
          {Array.from({ length: 6 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <Bar data={data} options={options} height={200} />
    </div>
  );
}
