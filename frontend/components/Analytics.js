import { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import "../styles/globals.css";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [swapVolume, setSwapVolume] = useState(0);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // 🔄 Atnaujina kas 60s
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/api/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });

      setStats(response.data);
      setActiveUsers(response.data.activeUsers);
      setTransactions(response.data.transactions);
      setSwapVolume(response.data.swapVolume);

      updateChart(response.data);
      setLoading(false);
    } catch (error) {
      console.error("⚠️ Analytics fetch error:", error);
      setLoading(false);
    }
  };

  const updateChart = (data) => {
    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById("analyticsChart").getContext("2d");
    const newChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Swaps", "Transactions", "Active Users"],
        datasets: [
          {
            label: "Activity",
            data: [data.swapVolume, data.transactions.length, data.activeUsers.length],
            backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
          },
        ],
      },
    });

    setChartInstance(newChartInstance);
  };

  if (loading) return <p className="loading">🔄 Loading analytics...</p>;

  return (
    <div className="analytics-container">
      <h1>📊 System Analytics</h1>

      <div className="chart-container">
        <canvas id="analyticsChart"></canvas>
      </div>

      <h3>👥 Active Users: {activeUsers.length}</h3>
      <ul>
        {activeUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>

      <h3>💰 Total Swap Volume: {swapVolume} BNB</h3>

      <h3>🔄 Recent Transactions</h3>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 10).map((tx, index) => (
            <tr key={index}>
              <td>{tx.hash.substring(0, 10)}...</td>
              <td>{tx.from.substring(0, 6)}...{tx.from.slice(-4)}</td>
              <td>{tx.to.substring(0, 6)}...{tx.to.slice(-4)}</td>
              <td>{tx.amount} BNB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Analytics;
