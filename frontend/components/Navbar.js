// 📂 /components/Navbar.js – Ultimate Premium Navbar 🚀
import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import { useTheme } from "./ThemeContext";
import "../styles/globals.css";

export default function Navbar() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, account);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    const netName = netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network";
    setNetwork(netName);
  };

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

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`
      );
      const data = await response.json();
      setConvertedBalance({
        usd: (bnbAmount * data.binancecoin.usd).toFixed(2),
        eur: (bnbAmount * data.binancecoin.eur).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant valiutų kursus:", error);
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
        detectNetwork(web3Instance);
        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("🔴 MetaMask klaida:", error);
      }
    } else {
      alert("🚨 MetaMask nerastas!");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
      });
      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      localStorage.setItem("walletAccount", accounts[0]);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("🔴 WalletConnect klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetwork("");
    setBalance("0.00");
    localStorage.removeItem("walletAccount");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">
          <a>🏦 NordBaltic Pay</a>
        </Link>
      </div>

      {/* 📌 NAVIGATION MENU */}
      <div className={`menu ${menuOpen ? "open" : ""}`}>
        <Link href="/dashboard"><a>📊 Dashboard</a></Link>
        <Link href="/staking"><a>💸 Staking</a></Link>
        <Link href="/transactions"><a>📜 Transactions</a></Link>
        <Link href="/swap"><a>🔄 Swap</a></Link>
        <Link href="/donations"><a>❤️ Donations</a></Link>
        <Link href="/admin"><a>🛠️ Admin</a></Link>
      </div>

      {/* 🔗 WALLET CONNECTION */}
      <div className="wallet-section">
        {account ? (
          <div className="wallet-info">
            <p className="wallet-address">
              ✅ {account.substring(0, 6)}...{account.slice(-4)}
            </p>
            <p className="network-status">{network}</p>
            <p className="wallet-balance">💰 {balance} BNB</p>
            {convertedBalance && (
              <p className="converted-balance">
                ≈ {currency === "USD" ? convertedBalance.usd : convertedBalance.eur} {currency}
              </p>
            )}
            <select onChange={(e) => setCurrency(e.target.value)} value={currency}>
              <option value="USD">💵 USD</option>
              <option value="EUR">💶 EUR</option>
            </select>
            <QRCode value={account} size={50} />
            <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
              ❌ Disconnect
            </button>
          </div>
        ) : (
          <div className="wallet-buttons">
            <button className="wallet-connect-btn" onClick={connectWalletConnect}>
              🔗 WalletConnect
            </button>
            <button className="wallet-connect-btn" onClick={connectMetaMask}>
              🦊 MetaMask
            </button>
          </div>
        )}
      </div>

      {/* 🌙 THEME SWITCHER */}
      <button className="theme-switcher" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* ☰ MOBILE MENU TOGGLE */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
}
