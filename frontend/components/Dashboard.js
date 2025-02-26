import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import QRCode from "qrcode.react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../context/ThemeContext";
import "../styles/globals.css";
import "chart.js/auto";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Dashboard() {
  const { theme } = useTheme();
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [balanceChange, setBalanceChange] = useState({ "24h": 0, "1w": 0, "1m": 0 });
  const [currency, setCurrency] = useState("USD");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [stakingRewards, setStakingRewards] = useState("0.00");
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState("1w");

  useEffect(() => {
    fetchUserAccount();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchBalanceChange();
      fetchChartData(timeframe);
      fetchStakingRewards();
    }
  }, [account, timeframe]);

  // 🔵 Fetch user account from Supabase
  const fetchUserAccount = async () => {
    const { data, error } = await supabase.from("users").select("wallet, balance").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
      setBalance(data.balance || "0.00");
    } else if (error) {
      console.error("🔴 Klaida gaunant vartotojo duomenis:", error);
    }
  };

  // 🦊 MetaMask login
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const userWallet = accounts[0];

        setAccount(userWallet);
        await supabase.from("users").upsert({ wallet: userWallet });

        fetchBalance(web3Instance, userWallet);
        fetchBalanceChange();
        fetchChartData(timeframe);
        fetchStakingRewards();
      } catch (error) {
        console.error("🔴 MetaMask error:", error);
      }
    } else {
      alert("🚨 MetaMask not found!");
    }
  };

  // 💰 Fetch balance
  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
      
      await supabase.from("users").update({ balance: balanceEth }).eq("wallet", account);
    } catch (error) {
      console.error("🔴 Error fetching balance:", error);
    }
  };

  // 📈 Fetch balance changes
  const fetchBalanceChange = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=30"
      );
      const prices = response.data.prices;
      setBalanceChange({
        "24h": ((prices[prices.length - 1][1] / prices[prices.length - 2][1] - 1) * 100).toFixed(2),
        "1w": ((prices[prices.length - 1][1] / prices[prices.length - 8][1] - 1) * 100).toFixed(2),
        "1m": ((prices[prices.length - 1][1] / prices[0][1] - 1) * 100).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Error fetching price change:", error);
    }
  };

  // 🔄 Currency conversion
  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`
      );
      const rates = response.data.binancecoin;
      setConvertedBalance({
        usd: (bnbAmount * rates.usd).toFixed(2),
        eur: (bnbAmount * rates.eur).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Error fetching exchange rates:", error);
    }
  };

  // 📊 Fetch staking rewards from Supabase
  const fetchStakingRewards = async () => {
    if (!account) return;
    
    const { data, error } = await supabase.from("stake").select("rewards").eq("wallet", account).single();
    if (data) {
      setStakingRewards(data.rewards || "0.00");
    } else if (error) {
      console.error("🔴 Klaida gaunant staking reward'us:", error);
    }
  };

  // 📊 Fetch chart data
  const fetchChartData = async (selectedTimeframe) => {
    const days = selectedTimeframe === "24h" ? 1 : selectedTimeframe === "1w" ? 7 : 30;
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${days}`
      );
      const prices = response.data.prices;
      setChartData({
        labels: prices.map((entry) => new Date(entry[0]).toLocaleDateString()),
        datasets: [
          {
            label: "BNB Price",
            data: prices.map((entry) => entry[1]),
            borderColor: "#FFD700",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("🔴 Error fetching chart data:", error);
    }
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <h1 className="dashboard-title">🚀 NordBaltic Pay Dashboard</h1>

      {!account ? (
        <button className="wallet-connect-btn" onClick={connectMetaMask}>🦊 Connect MetaMask</button>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="wallet-balance">💰 {balance} BNB</p>
          <p className="staking-rewards">🏆 Staking Rewards: {stakingRewards} BNB</p>
          <QRCode value={account} size={128} />

          <h3>📊 Balance Chart</h3>
          {chartData && <Line data={chartData} />}

          <div className="dashboard-buttons">
            <Link href="/send"><a>📤 Send</a></Link>
            <Link href="/staking"><a>💸 Stake</a></Link>
            <Link href="/swap"><a>🔄 Swap</a></Link>
          </div>
        </>
      )}
    </div>
  );
      }
