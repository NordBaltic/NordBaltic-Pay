import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Box, Card, CardContent, Typography, Button, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Snackbar, Alert, Select, MenuItem, CircularProgress
} from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState("🟢 Live");
  const [bnbPrice, setBnbPrice] = useState("0.00");
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchBNBPrice();
    subscribeToChanges();
  }, []);

  // 📌 Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (error) console.error("🔴 Klaida gaunant vartotojus:", error);
    else setUsers(data);
  };

  // 📌 Fetch transactions from Supabase
  const fetchTransactions = async () => {
    const { data, error } = await supabase.from("transactions").select("*").order("timestamp", { ascending: false });
    if (error) console.error("🔴 Klaida gaunant transakcijas:", error);
    else setTransactions(data);
    setLoading(false);
  };

  // 🔄 Live monitoring: Fetch BNB price
  const fetchBNBPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd");
      const data = await response.json();
      setBnbPrice(data.binancecoin.usd.toFixed(2));
    } catch (error) {
      console.error("🔴 Klaida gaunant BNB kainą:", error);
    }
  };

  // 🚀 Real-time Supabase listeners
  const subscribeToChanges = () => {
    supabase.channel("users")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, (payload) => {
        setUsers((prev) => [payload.new, ...prev]);
        setNotifications((prev) => [`👤 New user joined: ${payload.new.wallet}`, ...prev]);
      })
      .subscribe();

    supabase.channel("transactions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload) => {
        setTransactions((prev) => [payload.new, ...prev]);
        setNotifications((prev) => [`🔄 New transaction: ${payload.new.amount} BNB`, ...prev]);
      })
      .subscribe();
  };

  // 📊 Generate Chart Data
  const chartData = {
    labels: transactions.slice(0, 10).map((tx) => new Date(tx.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Transaction Volume",
        data: transactions.slice(0, 10).map((tx) => parseFloat(tx.amount)),
        borderColor: "#FFD700",
        backgroundColor: "rgba(255, 215, 0, 0.3)",
        fill: true,
      },
    ],
  };

  return (
    <Box className="admin-container p-6">
      <Typography variant="h4" className="text-center mb-6 neon-text">🛠️ Admin Panel</Typography>
      
      {/* Live System Monitoring */}
      <Box className="live-status mb-6 p-4 text-center glass-card">
        <Typography variant="h6">🌍 System Status: {systemStatus}</Typography>
        <Typography variant="h6">💰 BNB Price: ${bnbPrice}</Typography>
      </Box>

      {loading ? (
        <Box className="flex justify-center">
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {/* Notifications */}
          {notifications.length > 0 && (
            <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
              <Alert severity="info">{notifications[0]}</Alert>
            </Snackbar>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h5">👤 Total Users</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h5">💳 Total Transactions</Typography>
                  <Typography variant="h4">{transactions.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transactions Chart */}
          <Box className="chart-container mt-6">
            <Typography variant="h5">📊 Transactions Volume</Typography>
            <Line data={chartData} />
          </Box>

          {/* Users Table */}
          <Box className="table-container mt-6">
            <Typography variant="h5" className="mb-4">👤 Users List</Typography>
            <TableContainer component={Paper} className="glass-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Wallet</TableCell>
                    <TableCell>Balance (BNB)</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id.substring(0, 6)}...</TableCell>
                      <TableCell>{user.wallet.substring(0, 6)}...{user.wallet.slice(-4)}</TableCell>
                      <TableCell>{user.balance}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
}
