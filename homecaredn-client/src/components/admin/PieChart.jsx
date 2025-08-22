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
        label: "Users by Device",
        data: [55, 25, 20], // dữ liệu mẫu
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // xanh dương
          "rgba(34, 197, 94, 0.7)", // xanh lá
          "rgba(234, 179, 8, 0.7)", // vàng
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
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
      <h6 className="mb-4 text-xl capitalize dark:text-white">
        {t("adminDashboard.pieChart.serviceRequests")}
      </h6>

      <Pie data={data} options={options} />
    </div>
  );
}
