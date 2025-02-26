import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

export default function AdminSecurity() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userList, setUserList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [nodeStatus, setNodeStatus] = useState("Checking...");
  const [systemHealth, setSystemHealth] = useState({ uptime: "Loading...", load: "Loading..." });
  const [statusMessage, setStatusMessage] = useState("");
  const [newBanAddress, setNewBanAddress] = useState("");
  const [newRefundData, setNewRefundData] = useState({ address: "", amount: "" });

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          setIsAdmin(accounts[0].toLowerCase() === adminWallet);

          fetchSecurityData();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await axios.get("/api/admin/security");
      setUserList(response.data.bannedUsers);
      setLogs(response.data.logs);
      setIs2FAEnabled(response.data.is2FAEnabled);
      setServerStatus(response.data.serverStatus);
      setNodeStatus(response.data.nodeStatus);
      setSystemHealth(response.data.systemHealth);
    } catch (error) {
      console.error("⚠️ Security data fetch error:", error);
    }
  };

  const handleBanUnban = async (userAddress, isBanned) => {
    try {
      await axios.post("/api/admin/ban", { userAddress, isBanned });
      setStatusMessage(`✅ User ${isBanned ? "banned" : "unbanned"} successfully.`);
      fetchSecurityData();
    } catch (error) {
      console.error("❌ Error updating user status:", error);
    }
  };

  const handleFreezeUnfreeze = async (userAddress, isFrozen) => {
    try {
      await axios.post("/api/admin/freeze", { userAddress, isFrozen });
      setStatusMessage(`✅ Funds ${isFrozen ? "frozen" : "unfrozen"} successfully.`);
      fetchSecurityData();
    } catch (error) {
      console.error("❌ Error updating funds status:", error);
    }
  };

  const handleRefund = async (userAddress, amount) => {
    try {
      await axios.post("/api/admin/refund", { userAddress, amount });
      setStatusMessage(`✅ Refunded ${amount} BNB to ${userAddress}`);
      fetchSecurityData();
    } catch (error) {
      console.error("❌ Refund failed:", error);
    }
  };

  const toggle2FA = async () => {
    try {
      await axios.post("/api/admin/toggle-2fa");
      setIs2FAEnabled(!is2FAEnabled);
    } catch (error) {
      console.error("🔒 2FA toggle error:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-security">
        <h2>🚨 Access Denied</h2>
        <p>🔒 You are not authorized to view this section.</p>
      </div>
    );
  }

  return (
    <div className="admin-security">
      <h2>🛡️ Security & System Health</h2>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {/* 📡 Serverių būklė */}
      <div className="system-status">
        <h3>🖥️ System Health</h3>
        <p>⏳ Uptime: {systemHealth.uptime}</p>
        <p>📊 Load: {systemHealth.load}</p>
        <p>🔗 Node Status: {nodeStatus}</p>
        <p>🟢 Server Status: {serverStatus}</p>
      </div>

      {/* 🔐 2FA Valdymas */}
      <div className="section">
        <h3>🔐 2FA Authentication</h3>
        <button className="toggle-2fa" onClick={toggle2FA}>
          {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
        </button>
      </div>

      {/* 🚫 Ban/Unban Naudotojai */}
      <div className="section">
        <h3>🚫 Ban Users</h3>
        <input
          type="text"
          placeholder="Enter wallet address..."
          value={newBanAddress}
          onChange={(e) => setNewBanAddress(e.target.value)}
        />
        <button onClick={() => handleBanUnban(newBanAddress, true)}>Ban User</button>
        <button onClick={() => handleBanUnban(newBanAddress, false)}>Unban User</button>
      </div>

      {/* ❄️ Freeze/Unfreeze Lėšos */}
      <div className="section">
        <h3>❄️ Freeze/Unfreeze Funds</h3>
        {userList.map((user) => (
          <div key={user.address} className="user-item">
            <p>{user.address} - {user.isFrozen ? "❄️ Frozen" : "✅ Active"}</p>
            <button onClick={() => handleFreezeUnfreeze(user.address, !user.isFrozen)}>
              {user.isFrozen ? "Unfreeze" : "Freeze"}
            </button>
          </div>
        ))}
      </div>

      {/* 💸 Refund Lėšos */}
      <div className="section">
        <h3>💸 Refund Funds</h3>
        <input
          type="text"
          placeholder="Wallet Address"
          value={newRefundData.address}
          onChange={(e) => setNewRefundData({ ...newRefundData, address: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount (BNB)"
          value={newRefundData.amount}
          onChange={(e) => setNewRefundData({ ...newRefundData, amount: e.target.value })}
        />
        <button onClick={() => handleRefund(newRefundData.address, newRefundData.amount)}>Refund</button>
      </div>

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
    </div>
  );
      }
