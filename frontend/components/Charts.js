import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";

export default function Charts({ data }) {
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  useEffect(() => {
    fetchChartData(selectedPeriod);
    const interval = setInterval(() => fetchChartData(selectedPeriod), 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchChartData = async (period) => {
    try {
      const response = await axios.get(`/api/chart-data?period=${period}`);
      const { prices, volumes, labels } = response.data;

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "💰 BNB Price (USD)",
            data: prices,
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.3)",
            borderWidth: 2,
            tension: 0.4,
          },
          {
            label: "📊 Volume (BNB)",
            data: volumes,
            borderColor: "#1E90FF",
            backgroundColor: "rgba(30, 144, 255, 0.3)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("📉 Chart data fetch error:", error);
    }
  };

  return (
    <div className="chart-container">
      <h2>📊 Market Overview</h2>

      <div className="chart-filters">
        <label>Select Period:</label>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
              },
            },
            scales: {
              x: {
                grid: { display: false },
              },
              y: {
                grid: { color: "#444" },
              },
            },
          }}
        />
      ) : (
        <p>📡 Loading chart data...</p>
      )}
    </div>
  );
}
