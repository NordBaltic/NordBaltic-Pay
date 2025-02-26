import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import QRCode from "qrcode.react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import "../styles/globals.css";
import "chart.js/auto";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Dashboard() {
  const { theme } = useTheme();
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [stakingRewards, setStakingRewards] = useState("0.00");
  const [chartData, setChartData] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [systemStatus, setSystemStatus] = useState("🟢 Live");

  useEffect(() => {
    fetchUserAccount();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchChartData("7d");
      fetchStakingRewards();
      fetchLastTransaction();
    }
  }, [account]);

  // 🔵 Fetch user account from Supabase
  const fetchUserAccount = async () => {
    const { data, error } = await supabase.from("users").select("wallet, balance").single();
    if (data?.wallet) {
      setAccount(data.wallet);
      setBalance(data.balance || "0.00");
    } else if (error) {
      console.error("🔴 Klaida gaunant vartotojo duomenis:", error);
    }
  };

  // 💰 Fetch balance
  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(parseFloat(balanceEth).toFixed(4));
      await supabase.from("users").update({ balance: balanceEth }).eq("wallet", account);
    } catch (error) {
      console.error("🔴 Klaida gaunant balansą:", error);
    }
  };

  // 📈 Fetch chart data
  const fetchChartData = async (interval) => {
    try {
      const { data, error } = await supabase
        .from("bnb_price_history")
        .select("*")
        .eq("interval", interval)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        console.log("🔹 Naudojami duomenys iš Supabase DB");
        setChartData(JSON.parse(data[0].data));
        return;
      }

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
      await supabase.from("bnb_price_history").insert([{ interval, data: JSON.stringify(prices) }]);
    } catch (error) {
      console.error("🔴 Klaida gaunant kainų duomenis:", error);
    }
  };

  // 🏆 Fetch staking rewards
  const fetchStakingRewards = async () => {
    if (!account) return;
    const { data, error } = await supabase.from("stake").select("rewards").eq("wallet", account).single();
    if (data) {
      setStakingRewards(data.rewards || "0.00");
    } else if (error) {
      console.error("🔴 Klaida gaunant staking reward'us:", error);
    }
  };

  // 🔄 Fetch last transaction
  const fetchLastTransaction = async () => {
    if (!account) return;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("from", account)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();
      
    if (data) {
      setLastTransaction(data);
    } else if (error) {
      console.error("🔴 Klaida gaunant paskutinę transakciją:", error);
    }
  };

  return (
    <Box className={`dashboard-container ${theme} p-6`}>
      <Typography variant="h4" className="text-center mb-6">🚀 NordBaltic Pay Dashboard</Typography>

      {!account ? (
        <Button variant="contained" color="primary" className="w-full">
          🦊 Connect MetaMask
        </Button>
      ) : (
        <>
          <Typography variant="h6" className="text-center mb-4">{systemStatus}</Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h5">💰 Balance</Typography>
                  <Typography variant="h4">{balance} BNB</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="glass-card">
                <CardContent>
                  <Typography variant="h5">🏆 Staking Rewards</Typography>
                  <Typography variant="h4">{stakingRewards} BNB</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box className="chart-container mt-6">
            <Typography variant="h5" className="mb-4">📊 Balance Chart</Typography>
            {chartData && <Line data={chartData} />}
          </Box>

          <Grid container spacing={3} className="mt-6">
            <Grid item xs={4}>
              <Link href="/send"><Button variant="contained" fullWidth>📤 Send</Button></Link>
            </Grid>
            <Grid item xs={4}>
              <Link href="/staking"><Button variant="contained" fullWidth>💸 Stake</Button></Link>
            </Grid>
            <Grid item xs={4}>
              <Link href="/swap"><Button variant="contained" fullWidth>🔄 Swap</Button></Link>
            </Grid>
          </Grid>

          {lastTransaction && (
            <Card className="glass-card mt-6">
              <CardContent>
                <Typography variant="h5">🔄 Last Transaction</Typography>
                <Typography>To: {lastTransaction.to.substring(0, 6)}...{lastTransaction.to.slice(-4)}</Typography>
                <Typography>Amount: {lastTransaction.amount} BNB</Typography>
                <Typography>Status: {lastTransaction.status}</Typography>
                <Link href={`https://bscscan.com/tx/${lastTransaction.hash}`} target="_blank">
                  🔗 View on BSCScan
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
