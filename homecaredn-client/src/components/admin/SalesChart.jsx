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

  return <Line data={data} options={options} height={200} />;
}
