import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Chart from "chart.js/auto";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [swapVolume, setSwapVolume] = useState(0);
  const [chartInstance, setChartInstance] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [highTransactionAlert, setHighTransactionAlert] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    subscribeToUpdates();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // 📡 Traukiam duomenis iš Supabase
      const { data: analyticsData } = await supabase
        .from("analytics")
        .select("*")
        .eq("timeRange", timeRange)
        .single();

      if (analyticsData) {
        setStats(analyticsData);
        setActiveUsers(analyticsData.activeUsers);
        setTransactions(analyticsData.transactions);
        setSwapVolume(analyticsData.swapVolume);
        checkForHighTransactions(analyticsData.transactions);
        updateChart(analyticsData);
      }
      setLoading(false);
    } catch (error) {
      console.error("⚠️ Analytics fetch error:", error);
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    supabase
      .channel("analytics_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "analytics" }, fetchAnalytics)
      .subscribe();
  };

  const checkForHighTransactions = (transactions) => {
    const highTx = transactions.find((tx) => parseFloat(tx.amount) > 10); // 🔥 10 BNB ribinė vertė
    if (highTx) {
      setHighTransactionAlert(true);
      setTimeout(() => setHighTransactionAlert(false), 5000);
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
            label: `Activity (${timeRange})`,
            data: [data.swapVolume, data.transactions.length, data.activeUsers.length],
            backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
            borderColor: ["#66FF66", "#66CCFF", "#FFD700"],
            borderWidth: 1,
            hoverBackgroundColor: ["#66FF99", "#33BBFF", "#FFDD44"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  if (loading) return <p className="loading">🔄 Loading analytics...</p>;

  return (
    <Box className="analytics-container glass-card neon-border">
      <Typography variant="h4" className="text-center mb-4 neon-text">
        📊 System Analytics
      </Typography>

      {/* Time Range Filter */}
      <Box className="time-range-selector">
        <Typography variant="h6">📆 Select Time Range:</Typography>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="neon-dropdown"
        >
          <MenuItem value="24h">Last 24 Hours</MenuItem>
          <MenuItem value="7d">Last 7 Days</MenuItem>
          <MenuItem value="30d">Last 30 Days</MenuItem>
          <MenuItem value="365d">Last Year</MenuItem>
        </Select>
      </Box>

      {/* Chart */}
      <Paper className="chart-container">
        <canvas id="analyticsChart"></canvas>
      </Paper>

      {/* Active Users */}
      <Typography variant="h5" className="mt-4 neon-text">
        👥 Active Users: {activeUsers.length}
      </Typography>
      <Box className="user-list">
        {activeUsers.slice(0, 5).map((user, index) => (
          <Typography key={index} variant="body1">
            {user}
          </Typography>
        ))}
      </Box>

      {/* Swap Volume */}
      <Typography variant="h5" className="mt-4 neon-text">
        💰 Total Swap Volume: {swapVolume} BNB
      </Typography>

      {/* Transactions */}
      <Typography variant="h5" className="mt-4 neon-text">
        🔄 Recent Transactions
      </Typography>
      <table className="transactions-table glass-table">
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
              <td className={parseFloat(tx.amount) > 10 ? "highlight-tx" : ""}>
                {tx.amount} BNB
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* High Transaction Alert */}
      <Snackbar open={highTransactionAlert} autoHideDuration={5000}>
        <Alert severity="warning">⚠️ Large Transaction Detected! Check Admin Panel.</Alert>
      </Snackbar>
    </Box>
  );
};

export default Analytics;
