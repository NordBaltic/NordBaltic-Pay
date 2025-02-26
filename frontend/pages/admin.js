import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import dynamic from "next/dynamic";
import "../styles/globals.css";

const AdminPanel = dynamic(() => import("../components/Admin"), { ssr: false });

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ uptime: "Loading...", nodeStatus: "Checking..." });
  const [networkStats, setNetworkStats] = useState({ blockHeight: 0, activeNodes: 0 });
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

          fetchSystemData();
          fetchNetworkStats();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchSystemData = async () => {
    try {
      const response = await axios.get("/api/admin/system-health");
      setSystemHealth(response.data);
    } catch (error) {
      console.error("⚠️ Error fetching system health data:", error);
    }
  };

  const fetchNetworkStats = async () => {
    try {
      const response = await axios.get("https://api.bscscan.com/api?module=stats&action=chaininfo");
      setNetworkStats({
        blockHeight: response.data.result.blockNumber,
        activeNodes: response.data.result.nodeCount
      });
    } catch (error) {
      console.error("⚠️ Error fetching network stats:", error);
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

      {/* 🛠️ Sistemos sveikatos tikrinimas */}
      <div className="system-health">
        <h3>🖥️ System Health</h3>
        <p>⏳ Uptime: {systemHealth.uptime}</p>
        <p>🔗 Node Status: {systemHealth.nodeStatus}</p>
      </div>

      {/* 🔗 Tinklo statistika */}
      <div className="network-stats">
        <h3>🔗 Network Statistics</h3>
        <p>📏 Block Height: {networkStats.blockHeight}</p>
        <p>🌍 Active Nodes: {networkStats.activeNodes}</p>
      </div>

      {/* 🔧 Administravimo įrankiai */}
      <AdminPanel />

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}
