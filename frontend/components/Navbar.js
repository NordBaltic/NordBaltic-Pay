import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import WalletConnectButton from "./WalletConnectButton";

export default function Navbar() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function checkWallet() {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
        }
      }
    }
    checkWallet();
  }, []);

  return (
    <nav className="bg-darkblue text-white p-4 flex justify-between items-center shadow-lg border-b-2 border-gold">
      <div className="text-2xl font-bold text-gold">
        <Link href="/">NordBaltic Pay</Link>
      </div>
      <div className="flex space-x-6">
        <Link href="/" className="hover:text-gold transition">Dashboard</Link>
        <Link href="/staking" className="hover:text-gold transition">Staking</Link>
        <Link href="/donations" className="hover:text-gold transition">Donate</Link>
        <Link href="/transactions" className="hover:text-gold transition">Transactions</Link>
        <Link href="/settings" className="hover:text-gold transition">Settings</Link>
      </div>
      <div className="flex items-center space-x-4">
        {walletAddress ? (
          <span className="px-4 py-2 bg-gold text-darkblue font-bold rounded-lg">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        ) : (
          <WalletConnectButton />
        )}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="bg-gold text-darkblue px-3 py-1 rounded-lg"
        >
          {isDarkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
}
