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
  const router = useRouter();

  useEffect(() => {
    fetchBnbPrice();
    if (account) {
      setTimeout(() => {
        router.push("/dashboard"); // 🔥 Auto redirect jei jau prisijungęs!
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
    <div className="home-container">
      <header className="hero">
        <h1 className="hero-title">🚀 Welcome to NordBaltic Pay</h1>
        <p className="hero-subtitle">The next-gen Web3 financial ecosystem.</p>
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={() => connectWallet("WalletConnect")}>🔗 Connect WalletConnect</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("MetaMask")}>🦊 Connect MetaMask</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("Coinbase")}>🏦 Connect Coinbase</button>
        </div>
      </header>

      {account ? (
        <div className="account-section">
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)} ({walletType})</p>
          <p className="network-status">🌍 Binance Smart Chain</p>
          <QRCode value={account} size={150} className="qr-code" />
          {bnbPrice && (
            <p className="bnb-price">1 BNB ≈ {bnbPrice[currency.toLowerCase()]} {currency}</p>
          )}
          <button className="dashboard-btn" onClick={() => router.push("/dashboard")}>Go to Dashboard ➡️</button>
        </div>
      ) : (
        <p className="connect-notice">👆 Please connect your wallet to continue.</p>
      )}

      <section className="features">
        <h2>🌟 Why NordBaltic Pay?</h2>
        <div className="features-grid">
          <div className="feature-card">💳 Secure & Fast Transactions</div>
          <div className="feature-card">🔄 Automated Staking Rewards</div>
          <div className="feature-card">📊 Real-Time Token & Portfolio Tracking</div>
          <div className="feature-card">🌍 Supports Global Charities</div>
          <div className="feature-card">🔐 Decentralized & Non-Custodial</div>
          <div className="feature-card">🚀 Built for Web3 & The Future</div>
        </div>
      </section>

      <section className="cta-section">
        <h2>📲 Get Started Today!</h2>
        <p>Join the decentralized financial revolution with NordBaltic Pay.</p>
        <button className="cta-btn" onClick={() => router.push("/dashboard")}>Start Now 🚀</button>
      </section>

      <footer className="footer">
        <p>© 2025 NordBaltic Pay. All rights reserved.</p>
      </footer>
    </div>
  );
}
