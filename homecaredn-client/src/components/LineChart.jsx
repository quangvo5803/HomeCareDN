import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
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

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesChart() {
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
        label: "Sales",
        data: [65, 59, 80, 81, 56, 55, 70, 75, 90, 100, 95, 110],
        borderColor: "rgb(59,130,246)", // xanh dương
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.4,
        fill: true,
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
      },
      y: {
        ticks: { color: "#666" },
      },
    },
  };

  return (
    <div className="border-black/12.5 dark:bg-slate-850 dark:shadow-dark-xl shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
      <div className="border-black/12.5 mb-0 flex items-center justify-between rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0">
        <h6 className="capitalize dark:text-white">
          {t("adminDashboard.salesChart.salesOverview")}
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

      <div className="flex-auto p-4">
        <Line data={data} options={options} height={200} />
      </div>
    </div>
  );
}
