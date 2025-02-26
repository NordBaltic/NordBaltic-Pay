import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "../hooks/useWallet";

export default function Navbar() {
  const { connectWallet, disconnectWallet, walletAddress } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="logo">
          NordBaltic Pay
        </Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/staking">Staking</Link>
          <Link href="/donations">Donate</Link>
          <Link href="/transactions">Transactions</Link>
        </div>
        <div className="wallet-section">
          {walletAddress ? (
            <button className="wallet-btn" onClick={disconnectWallet}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </button>
          ) : (
            <button className="wallet-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
