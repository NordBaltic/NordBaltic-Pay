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
      fetchBalanceChange();
      fetchChartData("1w");
      fetchStakingRewards();
      fetchLastTransaction();
    }
  }, [account]);

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

  // 📈 Fetch balance changes
  const fetchBalanceChange = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=1");
      const prices = response.data.prices;
      setBalanceChange({
        "24h": ((prices[prices.length - 1][1] / prices[0][1] - 1) * 100).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant kainų pokytį:", error);
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

    const { data, error } = await supabase.from("transactions").select("*").eq("from", account).order("timestamp", { ascending: false }).limit(1).single();
    if (data) {
      setLastTransaction(data);
    } else if (error) {
      console.error("🔴 Klaida gaunant paskutinę transakciją:", error);
    }
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <h1 className="dashboard-title">🚀 NordBaltic Pay Dashboard</h1>

      {!account ? (
        <button className="wallet-connect-btn">🦊 Connect MetaMask</button>
      ) : (
        <>
          <p className="system-status">{systemStatus}</p>
          <div className="dashboard-card">
            <p className="wallet-balance">💰 {balance} BNB</p>
            <p className="staking-rewards">🏆 {stakingRewards} BNB (Staking Rewards)</p>
            <p className={`balance-change ${balanceChange["24h"] >= 0 ? "positive" : "negative"}`}>
              24h Change: {balanceChange["24h"]}%
            </p>
          </div>

          <h3>📊 Balance Chart</h3>
          {chartData && <Line data={chartData} />}

          <div className="dashboard-buttons">
            <Link href="/send"><a className="button">📤 Send</a></Link>
            <Link href="/staking"><a className="button">💸 Stake</a></Link>
            <Link href="/swap"><a className="button">🔄 Swap</a></Link>
          </div>

          {lastTransaction && (
            <div className="transaction-card">
              <h3>🔄 Last Transaction</h3>
              <p>To: {lastTransaction.to.substring(0, 6)}...{lastTransaction.to.slice(-4)}</p>
              <p>Amount: {lastTransaction.amount} BNB</p>
              <p>Status: {lastTransaction.status}</p>
              <a href={`https://bscscan.com/tx/${lastTransaction.hash}`} target="_blank">🔗 View on BSCScan</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
