import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminControls from "../components/Admin";
import SecurityControls from "../components/Security";
import AnalyticsPanel from "../components/Analytics";
import Web3 from "web3";
import "../styles/globals.css";

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          if (accounts[0].toLowerCase() === adminWallet) {
            setIsAdmin(true);
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      } else {
        alert("⚠️ Please install MetaMask!");
        router.push("/");
      }
    };

    loadAccount();
  }, []);

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>👑 Admin Dashboard</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      <div className="admin-grid">
        <div className="admin-section">
          <AdminControls />
        </div>
        <div className="admin-section">
          <SecurityControls />
        </div>
        <div className="admin-section">
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
