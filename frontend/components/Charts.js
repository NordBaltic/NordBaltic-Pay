import { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import "../styles/globals.css";

const Charts = () => {
  const [chartInstance, setChartInstance] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("24h");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData(selectedInterval);
  }, [selectedInterval]);

  const fetchChartData = async (interval) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${
          interval === "24h" ? 1 : interval === "7d" ? 7 : 30
        }&interval=daily`
      );

      const prices = response.data.prices.map((data) => ({
        x: new Date(data[0]),
        y: data[1],
      }));

      setChartData(prices);
      setLoading(false);

      updateChart(prices);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const updateChart = (data) => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById("balanceChart").getContext("2d");
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "BNB Price (USD)",
            data,
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: "time", time: { unit: "day" }, grid: { color: "#444" } },
          y: { grid: { color: "#444" }, ticks: { callback: (value) => `$${value}` } },
        },
      },
    });

    setChartInstance(newChart);
  };

  return (
    <div className="charts-container">
      <h1>📊 BNB Price Chart</h1>
      <div className="chart-controls">
        <button onClick={() => setSelectedInterval("24h")}>24H</button>
        <button onClick={() => setSelectedInterval("7d")}>7D</button>
        <button onClick={() => setSelectedInterval("30d")}>30D</button>
      </div>
      {loading ? <p>🔄 Loading chart...</p> : <canvas id="balanceChart"></canvas>}
    </div>
  );
};

export default Charts;
