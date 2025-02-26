import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import ThemeSwitcher from "./ThemeSwitcher"; // ✅ Pridedame temos perjungiklį

export default function Navbar() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [menuOpen, setMenuOpen] = useState(false);

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
    } catch (error) {
      console.error("🔴 Klaida gaunant balansą:", error);
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

      <div className={`menu ${menuOpen ? "open" : ""}`}>
        <Link href="/dashboard"><a>📊 Dashboard</a></Link>
        <Link href="/staking"><a>💸 Staking</a></Link>
        <Link href="/transactions"><a>📜 Transactions</a></Link>
        <Link href="/donations"><a>❤️ Donations</a></Link>
        <Link href="/admin"><a>🛠️ Admin</a></Link>
      </div>

      <div className="wallet-section">
        {account ? (
          <div className="wallet-info">
            <p className="wallet-address">
              ✅ {account.substring(0, 6)}...{account.slice(-4)}
            </p>
            <p className="network-status">{network}</p>
            <p className="wallet-balance">💰 {balance} BNB</p>
            <QRCode value={account} size={60} />
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

      {/* ✅ PRIDEDAME TEMOS PERJUNGIMĄ */}
      <ThemeSwitcher />

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
}
