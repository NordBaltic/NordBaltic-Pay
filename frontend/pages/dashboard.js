import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import "../styles/globals.css";

// ✅ Dinaminis Admin Komponentas (kad Next.js SSR nesugadintų Web3 prisijungimo)
const AdminPanel = dynamic(() => import("../components/Admin"), { ssr: false });

export default function AdminPage() {
  const [adminAccount, setAdminAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const storedAdmin = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
      if (adminAccount && adminAccount.toLowerCase() === storedAdmin) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [adminAccount]);

  const connectAdminWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAdminAccount(accounts[0]);
      } catch (error) {
        console.error("Admin Wallet Error:", error);
      }
    } else {
      alert("MetaMask not detected!");
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-title">👑 Admin Dashboard</h1>

      {!adminAccount ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectAdminWallet}>
            🦊 Connect Admin Wallet
          </button>
        </div>
      ) : isAdmin ? (
        <>
          <p className="wallet-address">✅ Connected as: {adminAccount.substring(0, 6)}...{adminAccount.slice(-4)}</p>
          <AdminPanel adminAccount={adminAccount} />
        </>
      ) : (
        <p className="error-text">⛔ Access Denied! You are not the admin.</p>
      )}
    </div>
  );
}
