import { useState, useEffect } from "react";
import AdminControls from "../components/Admin";
import Security from "../components/Security";
import Analytics from "../components/Analytics";
import "../styles/globals.css";

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          setIsAdmin(accounts[0].toLowerCase() === adminWallet);
        } catch (error) {
          console.error("❌ MetaMask connection error:", error);
        }
      }
      setLoading(false);
    };

    loadAccount();
  }, []);

  if (loading) return <p className="loading">🔄 Loading admin panel...</p>;

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>👑 Admin Dashboard</h1>
      <p>Welcome, <strong>{account}</strong></p>

      <div className="admin-section">
        <h2>📊 Platform Analytics</h2>
        <Analytics />
      </div>

      <div className="admin-section">
        <h2>⚙️ Admin Controls</h2>
        <AdminControls />
      </div>

      <div className="admin-section">
        <h2>🛡️ Security & User Management</h2>
        <Security />
      </div>
    </div>
  );
}
