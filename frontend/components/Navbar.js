// 📂 /frontend/components/Navbar.js
// ✅ NAVBAR – pagrindinė viršutinė navigacijos juosta su prisijungimu ir atsijungimu

import Link from "next/link";
import { useState, useEffect } from "react";
import Web3 from "web3";

export default function Navbar({ account, onDisconnect }) {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (account) {
      setWalletAddress(account);
    }
  }, [account]);

  return (
    <nav className="navbar">
      {/* 🔗 Logo ir pagrindinis puslapis */}
      <div className="navbar-logo">
        <Link href="/">
          <a className="logo-text">NordBaltic Pay</a>
        </Link>
      </div>

      {/* 🔗 Navigacijos meniu */}
      <ul className="navbar-links">
        <li><Link href="/dashboard"><a>Dashboard</a></Link></li>
        <li><Link href="/staking"><a>Staking</a></Link></li>
        <li><Link href="/donations"><a>Donations</a></Link></li>
        <li><Link href="/transactions"><a>Transactions</a></Link></li>
      </ul>

      {/* 🟢 Prisijungimo mygtukas arba rodomas adresas su atsijungimu */}
      <div className="navbar-wallet">
        {walletAddress ? (
          <div className="wallet-info">
            <span className="wallet-address">
              {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button className="disconnect-btn" onClick={onDisconnect}>
              Logout
            </button>
          </div>
        ) : (
          <button className="connect-wallet-btn">
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
