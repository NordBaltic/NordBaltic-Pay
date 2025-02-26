import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Link from "next/link";
import QRCode from "qrcode.react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../components/ThemeContext";
import "../styles/globals.css";
import "chart.js/auto";

export default function Dashboard() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState("0.00");
  const [balanceChange, setBalanceChange] = useState({ "24h": 0, "1w": 0, "1m": 0 });
  const [currency, setCurrency] = useState("USD");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState("1w");
  const { theme } = useTheme();

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchBalanceChange();
      fetchChartData(timeframe);
    }
  }, [account, timeframe]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
    } catch (error) {
      console.error("🔴 Klaida gaunant balansą:", error);
    }
  };

  const fetchBalanceChange = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=30");
      const prices = response.data.prices;
      setBalanceChange({
        "24h": ((prices[prices.length - 1][1] / prices[prices.length - 2][1] - 1) * 100).toFixed(2),
        "1w": ((prices[prices.length - 1][1] / prices[prices.length - 8][1] - 1) * 100).toFixed(2),
        "1m": ((prices[prices.length - 1][1] / prices[0][1] - 1) * 100).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant kainų pokyčius:", error);
    }
  };

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      const rates = response.data.binancecoin;
      setConvertedBalance({
        usd: (bnbAmount * rates.usd).toFixed(2),
        eur: (bnbAmount * rates.eur).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant valiutų kursus:", error);
    }
  };

  const fetchChartData = async (selectedTimeframe) => {
    const days = selectedTimeframe === "24h" ? 1 : selectedTimeframe === "1w" ? 7 : 30;
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${days}`);
      const prices = response.data.prices;
      setChartData({
        labels: prices.map((entry) => new Date(entry[0]).toLocaleDateString()),
        datasets: [
          {
            label: "BNB Price",
            data: prices.map((entry) => entry[1]),
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant grafiko duomenis:", error);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
        fetchBalance(web3Instance, accounts[0]);
        fetchBalanceChange();
        fetchChartData(timeframe);
      } catch (error) {
        console.error("🔴 MetaMask klaida:", error);
      }
    } else {
      alert("🚨 MetaMask nerastas!");
    }
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <h1 className="dashboard-title">📊 Dashboard</h1>

      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectMetaMask}>🦊 Connect MetaMask</button>
        </div>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="wallet-balance">💰 {balance} BNB</p>

          <div className="balance-change">
            <p>📈 24h: <span className={balanceChange["24h"] > 0 ? "positive" : "negative"}>{balanceChange["24h"]}%</span></p>
            <p>📈 1w: <span className={balanceChange["1w"] > 0 ? "positive" : "negative"}>{balanceChange["1w"]}%</span></p>
            <p>📈 1m: <span className={balanceChange["1m"] > 0 ? "positive" : "negative"}>{balanceChange["1m"]}%</span></p>
          </div>

          <label>Show in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">💵 USD</option>
            <option value="EUR">💶 EUR</option>
          </select>
          {convertedBalance && <p className="converted-balance">≈ {currency === "USD" ? convertedBalance.usd : convertedBalance.eur} {currency}</p>}

          <h3>📊 Balance Chart</h3>
          <select onChange={(e) => setTimeframe(e.target.value)}>
            <option value="24h">Last 24h</option>
            <option value="1w">Last 1 week</option>
            <option value="1m">Last 1 month</option>
          </select>
          {chartData && <Line data={chartData} />}

          <div className="dashboard-buttons">
            <Link href="/send"><a className="dashboard-btn">📤 Send</a></Link>
            <Link href="/receive"><a className="dashboard-btn">📥 Receive</a></Link>
            <Link href="/staking"><a className="dashboard-btn">💸 Stake</a></Link>
            <Link href="/swap"><a className="dashboard-btn">🔄 Swap</a></Link>
            <Link href="/donations"><a className="dashboard-btn">❤️ Donate</a></Link>
          </div>
        </>
      )}
    </div>
  );
}
