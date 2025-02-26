import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

export default function AdminControls() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fees, setFees] = useState({ send: 3, swap: 0.2, stake: 4, donation: 3 });
  const [newFees, setNewFees] = useState({ send: "", swap: "", stake: "", donation: "" });
  const [userList, setUserList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
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
      const response = await axios.get("/api/admin");
      setUserList(response.data.bannedUsers);
      setLogs(response.data.logs);
      setIs2FAEnabled(response.data.is2FAEnabled);
      setFees(response.data.fees);
    } catch (error) {
      console.error("⚠️ Admin data fetch error:", error);
    }
  };

  const handleBanUnban = async (userAddress, isBanned) => {
    try {
      await axios.post("/api/admin/ban", { userAddress, isBanned });
      setStatusMessage(`✅ User ${isBanned ? "banned" : "unbanned"} successfully.`);
      fetchAdminData();
    } catch (error) {
      console.error("❌ Error updating user status:", error);
    }
  };

  const handleFreezeUnfreeze = async (userAddress, isFrozen) => {
    try {
      await axios.post("/api/admin/freeze", { userAddress, isFrozen });
      setStatusMessage(`✅ Funds ${isFrozen ? "frozen" : "unfrozen"} successfully.`);
      fetchAdminData();
    } catch (error) {
      console.error("❌ Error updating funds status:", error);
    }
  };

  const handleRefund = async (userAddress, amount) => {
    try {
      await axios.post("/api/admin/refund", { userAddress, amount });
      setStatusMessage(`✅ Refunded ${amount} BNB to ${userAddress}`);
      fetchAdminData();
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
      <h2>⚙️ Admin Controls</h2>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

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
      <div className="section">
        <h3>🚫 Ban Users</h3>
        <input
          type="text"
          placeholder="Enter wallet address..."
          onChange={(e) => setNewFees(e.target.value)}
        />
        <button onClick={() => handleBanUnban(newFees, true)}>Ban User</button>
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
