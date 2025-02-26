// 📂 /pages/dashboard.js - MAX PREMIUM DASHBOARD
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import Charts from "../components/Charts";
import "../styles/globals.css";

export default function Dashboard() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [currency, setCurrency] = useState("EUR");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [balanceChange, setBalanceChange] = useState(0);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchBalanceChange();
    }
  }, [account, currency]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      setConvertedBalance((bnbAmount * response.data.binancecoin[currency.toLowerCase()]).toFixed(2));
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
    }
  };

  const fetchBalanceChange = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=balancehistory&address=${account}&apikey=${apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === "1") {
        const history = response.data.result;
        const oldBalance = parseFloat(history[0].balance) / 10 ** 18;
        const change = ((bnbBalance - oldBalance) / oldBalance) * 100;
        setBalanceChange(change.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching balance change:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>🚀 My Dashboard</h1>
      <p className="wallet-address">✅ Connected: {account ? `${account.substring(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
      <p className="balance-text">💰 Balance: {bnbBalance} BNB (~{convertedBalance} {currency})</p>
      <p className="balance-change">📊 Change: {balanceChange}%</p>
      
      {/* Integruojame balansų grafiką */}
      <Charts account={account} currency={currency} />

      {/* Pagrindiniai veiksmai */}
      <div className="action-buttons">
        <button onClick={() => window.location.href = "/send"}>🚀 Send</button>
        <button onClick={() => window.location.href = "/receive"}>📥 Receive</button>
        <button onClick={() => window.location.href = "/staking"}>💸 Stake</button>
        <button onClick={() => window.location.href = "/donations"}>❤️ Donate</button>
      </div>
    </div>
  );
}// 📂 /pages/dashboard.js - MAX PREMIUM DASHBOARD
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import Charts from "../components/Charts";
import "../styles/globals.css";

export default function Dashboard() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [currency, setCurrency] = useState("EUR");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [balanceChange, setBalanceChange] = useState(0);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchBalanceChange();
    }
  }, [account, currency]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      setConvertedBalance((bnbAmount * response.data.binancecoin[currency.toLowerCase()]).toFixed(2));
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
    }
  };

  const fetchBalanceChange = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=balancehistory&address=${account}&apikey=${apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === "1") {
        const history = response.data.result;
        const oldBalance = parseFloat(history[0].balance) / 10 ** 18;
        const change = ((bnbBalance - oldBalance) / oldBalance) * 100;
        setBalanceChange(change.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching balance change:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>🚀 My Dashboard</h1>
      <p className="wallet-address">✅ Connected: {account ? `${account.substring(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
      <p className="balance-text">💰 Balance: {bnbBalance} BNB (~{convertedBalance} {currency})</p>
      <p className="balance-change">📊 Change: {balanceChange}%</p>
      
      {/* Integruojame balansų grafiką */}
      <Charts account={account} currency={currency} />

      {/* Pagrindiniai veiksmai */}
      <div className="action-buttons">
        <button onClick={() => window.location.href = "/send"}>🚀 Send</button>
        <button onClick={() => window.location.href = "/receive"}>📥 Receive</button>
        <button onClick={() => window.location.href = "/staking"}>💸 Stake</button>
        <button onClick={() => window.location.href = "/donations"}>❤️ Donate</button>
      </div>
    </div>
  );
}
