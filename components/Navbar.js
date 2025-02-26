// 📂 /frontend/components/Navbar.js - Pagrindinė navigacija
import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function Navbar() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };

    loadAccount();
  }, []);

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">
          <a>NordBaltic Pay</a>
        </Link>
      </div>
      <div className={`menu ${menuOpen ? "open" : ""}`}>
        <Link href="/dashboard"><a>Dashboard</a></Link>
        <Link href="/staking"><a>Staking</a></Link>
        <Link href="/transactions"><a>Transactions</a></Link>
        <Link href="/donations"><a>Donations</a></Link>
        <Link href="/admin"><a>Admin</a></Link>
        <Link href="/contact"><a>Contact</a></Link>
        <Link href="/privacy"><a>Privacy</a></Link>
        <Link href="/terms"><a>Terms</a></Link>
      </div>
      <div className="wallet-section">
        {account ? (
          <p className="wallet-address">Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
        ) : (
          <div className="wallet-buttons">
            <button className="wallet-connect-btn" onClick={connectWalletConnect}>
              Connect WalletConnect
            </button>
            <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
              Connect MetaMask
            </button>
          </div>
        )}
      </div>
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
}
