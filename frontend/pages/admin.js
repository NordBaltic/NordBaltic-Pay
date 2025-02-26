import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import AdminControls from "../components/AdminControls";
import "../styles/globals.css";

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState({ activeUsers: 0, totalTransactions: 0, totalVolume: 0 });
  const [systemHealth, setSystemHealth] = useState({ uptime: "Loading...", nodeStatus: "Checking..." });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          setIsAdmin(accounts[0].toLowerCase() === adminWallet);

          fetchAdminData();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      setUserStats(response.data.userStats);
      setSystemHealth(response.data.systemHealth);
    } catch (error) {
      console.error("⚠️ Error fetching admin data:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>⚙️ Admin Dashboard</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {/* 📊 Sistemos metrika */}
      <div className="stats-container">
        <div className="stat-box">
          <h3>👥 Active Users</h3>
          <p>{userStats.activeUsers}</p>
        </div>
        <div className="stat-box">
          <h3>💳 Total Transactions</h3>
          <p>{userStats.totalTransactions}</p>
        </div>
        <div className="stat-box">
          <h3>📊 Total Volume</h3>
          <p>{userStats.totalVolume} BNB</p>
        </div>
      </div>

      {/* 🛠️ Sistemos sveikatos tikrinimas */}
      <div className="system-health">
        <h3>🖥️ System Health</h3>
        <p>⏳ Uptime: {systemHealth.uptime}</p>
        <p>🔗 Node Status: {systemHealth.nodeStatus}</p>
      </div>

      {/* 🔧 Administravimo įrankiai */}
      <AdminControls />

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}
