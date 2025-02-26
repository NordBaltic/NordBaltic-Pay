import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import AdminSecurity from "./AdminSecurity";
import "../styles/globals.css";

export default function AdminPanel() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fees, setFees] = useState({ send: 3, swap: 0.2, stake: 4, donation: 3 });
  const [newFees, setNewFees] = useState({ send: "", swap: "", stake: "", donation: "" });
  const [userStats, setUserStats] = useState({ activeUsers: 0, totalTransactions: 0, totalVolume: 0 });
  const [marketData, setMarketData] = useState({ bnbPrice: 0 });
  const [systemHealth, setSystemHealth] = useState({ uptime: "Loading...", nodeStatus: "Checking..." });
  const [logs, setLogs] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
          fetchMarketData();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
      setLoading(false);
    };

    loadAccount();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      setUserStats(response.data.userStats);
      setLogs(response.data.logs);
      setSystemHealth(response.data.systemHealth);
      setFees(response.data.fees);
      setIs2FAEnabled(response.data.is2FAEnabled);
    } catch (error) {
      console.error("⚠️ Error fetching admin data:", error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd");
      setMarketData({ bnbPrice: response.data.binancecoin.usd });
    } catch (error) {
      console.error("⚠️ Error fetching market data:", error);
    }
  };

  const toggle2FA = async () => {
    try {
      await axios.post("/api/admin/toggle-2fa");
      setIs2FAEnabled(!is2FAEnabled);
      setStatusMessage(`✅ 2FA ${is2FAEnabled ? "disabled" : "enabled"} successfully.`);
    } catch (error) {
      console.error("🔒 2FA toggle error:", error);
    }
  };

  const updateFee = async (type) => {
    if (!newFees[type]) return;

    try {
      await axios.post("/api/admin/updateFee", { type, value: parseFloat(newFees[type]) });
      setStatusMessage(`✅ ${type.toUpperCase()} Fee Updated to ${newFees[type]}%`);
      fetchAdminData();
    } catch (error) {
      console.error("❌ Error updating fee:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-controls">
        <h2>🚨 Access Denied</h2>
        <p>🔒 You are not authorized to view this section.</p>
      </div>
    );
  }

  return (
    <div className="admin-controls">
      <h1>⚙️ Admin Dashboard</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {loading ? (
        <p className="loading-text">🔄 Loading admin data...</p>
      ) : (
        <>
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

          {/* 📈 Rinkos duomenys */}
          <div className="market-data">
            <h3>📈 Market Overview</h3>
            <p>BNB Price: ${marketData.bnbPrice}</p>
          </div>

          {/* 🔐 2FA Valdymas */}
          <div className="section">
            <h3>🔐 2FA Authentication</h3>
            <button className="toggle-2fa" onClick={toggle2FA}>
              {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
            </button>
          </div>

          {/* 💰 Mokesčių Valdymas */}
          <div className="fee-controls">
            <h3>💰 Fee Management</h3>
            {Object.keys(fees).map((type) => (
              <div key={type} className="fee-item">
                <label>{type.toUpperCase()} Fee: {fees[type]}%</label>
                <input
                  type="number"
                  placeholder={`New ${type} Fee`}
                  value={newFees[type]}
                  onChange={(e) => setNewFees({ ...newFees, [type]: e.target.value })}
                />
                <button className="update-btn" onClick={() => updateFee(type)}>Update</button>
              </div>
            ))}
          </div>

          {/* 🚫 Ban/Unban Naudotojai */}
          <AdminSecurity />

          {/* 📜 Security Logs */}
          <div className="section">
            <h3>📜 Security Logs</h3>
            <ul>
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>

          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </>
      )}
    </div>
  );
}
