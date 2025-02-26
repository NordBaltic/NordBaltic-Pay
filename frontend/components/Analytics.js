import { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import "../styles/globals.css";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("24h");
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // ⏳ Automatinis atnaujinimas kas 30s
    return () => clearInterval(interval);
  }, [timeFrame]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics?timeFrame=${timeFrame}`);
      setData(response.data);
      setLoading(false);
      updateChart(response.data);
    } catch (error) {
      console.error("❌ Klaida gaunant analitiką:", error);
      setLoading(false);
    }
  };

  const updateChart = (analyticsData) => {
    if (!analyticsData || !analyticsData.transactions) return;

    const ctx = document.getElementById("analyticsChart");
    if (chartInstance) {
      chartInstance.destroy(); // 🔄 Išvalyti seną diagramą prieš kuriant naują
    }

    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: analyticsData.transactions.map((tx) => tx.date),
        datasets: [
          {
            label: "📈 Transakcijos",
            data: analyticsData.transactions.map((tx) => tx.amount),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          x: { display: true },
          y: { beginAtZero: true },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  return (
    <div className="analytics-container">
      <h1>📊 Platform Analytics</h1>

      {/* ⏳ Laiko filtro pasirinkimas */}
      <div className="time-filter">
        <button onClick={() => setTimeFrame("24h")} className={timeFrame === "24h" ? "active" : ""}>24h</button>
        <button onClick={() => setTimeFrame("7d")} className={timeFrame === "7d" ? "active" : ""}>7d</button>
        <button onClick={() => setTimeFrame("1m")} className={timeFrame === "1m" ? "active" : ""}>1m</button>
      </div>

      {/* 📈 Analitikos rodikliai */}
      {loading ? (
        <p>🔄 Loading analytics...</p>
      ) : (
        <>
          <div className="analytics-summary">
            <p>🤑 Total Volume: <strong>{data.totalVolume} BNB</strong></p>
            <p>🔄 Total Transactions: <strong>{data.totalTransactions}</strong></p>
            <p>👥 Active Users: <strong>{data.activeUsers}</strong></p>
          </div>

          {/* 📉 Diagrama */}
          <canvas id="analyticsChart"></canvas>
        </>
      )}
    </div>
  );
}
