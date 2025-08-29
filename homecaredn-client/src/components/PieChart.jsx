import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { useTranslation } from "react-i18next";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function PieChart() {
  const { t } = useTranslation();
  const data = {
    labels: [
      t("adminDashboard.pieChart.construction"),
      t("adminDashboard.pieChart.repair"),
      t("adminDashboard.pieChart.material"),
    ],
    datasets: [
      {
        label: "Service Requests",
        data: [55, 25, 20], // dữ liệu mẫu
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)", // Indigo (xanh tím)
          "rgba(16, 185, 129, 0.7)", // Emerald (xanh ngọc)
          "rgba(244, 114, 182, 0.7)", // Pink (hồng)
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(16, 185, 129)",
          "rgb(244, 114, 182)",
        ],

        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
        },
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
        <select
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-slate-800 dark:text-white"
          onChange={(e) => console.log("Năm:", e.target.value)}
        >
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

      <Pie data={data} options={options} />
    </div>
  );
}
