import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";
import axios from "axios";
import "../styles/globals.css";

export default function Home() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [walletType, setWalletType] = useState(localStorage.getItem("walletType") || null);
  const [bnbPrice, setBnbPrice] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchBnbPrice();
    fetchRecentTransactions();
    if (account) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  }, [account]);

  const fetchBnbPrice = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur");
      setBnbPrice(response.data.binancecoin);
    } catch (error) {
      console.error("Error fetching BNB price:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get("https://api.bscscan.com/api?module=account&action=txlist&address=latest&sort=desc&apikey=YOUR_BSCSCAN_API_KEY");
      setTransactions(response.data.result.slice(0, 5)); // Tik 5 paskutiniai sandoriai
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const connectWallet = async (type) => {
    try {
      let provider;
      let web3Instance;
      let accounts;

      if (type === "MetaMask" && window.ethereum) {
        web3Instance = new Web3(window.ethereum);
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      } else if (type === "WalletConnect") {
        provider = new WalletConnectProvider({ rpc: { 56: "https://bsc-dataseed.binance.org/" } });
        await provider.enable();
        web3Instance = new Web3(provider);
        accounts = await web3Instance.eth.getAccounts();
      } else if (type === "Coinbase") {
        const coinbaseWallet = new CoinbaseWalletSDK({ appName: "NordBaltic Pay" });
        provider = coinbaseWallet.makeWeb3Provider("https://bsc-dataseed.binance.org/", 56);
        web3Instance = new Web3(provider);
        accounts = await web3Instance.eth.getAccounts();
      }

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setWalletType(type);
      localStorage.setItem("walletAccount", accounts[0]);
      localStorage.setItem("walletType", type);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className={`home-container ${darkMode ? "dark-mode" : ""}`}>
      <header className="hero">
        <h1 className="hero-title">🚀 Welcome to NordBaltic Pay</h1>
        <p className="hero-subtitle">The next-gen Web3 financial ecosystem.</p>
        <button className="dark-mode-toggle" onClick={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={() => connectWallet("WalletConnect")}>🔗 Connect WalletConnect</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("MetaMask")}>🦊 Connect MetaMask</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("Coinbase")}>🏦 Connect Coinbase</button>
        </div>
      </header>

      {account ? (
        <div className="account-section">
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)} ({walletType})</p>
          <QRCode value={account} size={150} className="qr-code" />
          {bnbPrice && (
            <p className="bnb-price">1 BNB ≈ {bnbPrice[currency.toLowerCase()]} {currency}</p>
          )}
          <button className="dashboard-btn" onClick={() => router.push("/dashboard")}>Go to Dashboard ➡️</button>
        </div>
      ) : (
        <p className="connect-notice">👆 Please connect your wallet to continue.</p>
      )}

      <section className="transactions">
        <h2>📡 Live Transactions</h2>
        <ul>
          {transactions.length > 0 ? transactions.map((tx) => (
            <li key={tx.hash}>
              <strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}
              <br />
              <strong>To:</strong> {tx.to.substring(0, 6)}...{tx.to.slice(-4)}
              <br />
              <strong>Amount:</strong> {parseFloat(tx.value) / 10 ** 18} BNB
              <br />
              <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">🔍 View on BSCScan</a>
            </li>
          )) : <p>No recent transactions.</p>}
        </ul>
      </section>

      <footer className="footer">
        <p>© 2025 NordBaltic Pay. All rights reserved.</p>
      </footer>
    </div>
  );
}
