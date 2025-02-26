import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const Admin = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userList, setUserList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [newBanAddress, setNewBanAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          setIsAdmin(accounts[0].toLowerCase() === adminWallet);

          fetchAdminData();
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
      const response = await axios.get("/api/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setUserList(response.data.bannedUsers);
      setLogs(response.data.logs);
      setIs2FAEnabled(response.data.is2FAEnabled);
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
      setStatusMessage("❌ Error processing request.");
    }
  };

  const handleFreezeUnfreeze = async (userAddress, isFrozen) => {
    try {
      await axios.post("/api/admin/freeze", { userAddress, isFrozen });
      setStatusMessage(`✅ Funds ${isFrozen ? "frozen" : "unfrozen"} successfully.`);
      fetchAdminData();
    } catch (error) {
      console.error("❌ Error updating funds status:", error);
      setStatusMessage("❌ Error processing request.");
    }
  };

  const handleRefund = async (userAddress, amount) => {
    try {
      await axios.post("/api/admin/refund", { userAddress, amount });
      setStatusMessage(`✅ Refunded ${amount} BNB to ${userAddress}`);
      fetchAdminData();
    } catch (error) {
      console.error("❌ Error processing refund:", error);
      setStatusMessage("❌ Refund failed.");
    }
  };

  const toggle2FA = async () => {
    try {
      await axios.post(
        "/api/admin/toggle-2fa",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );
      setIs2FAEnabled(!is2FAEnabled);
    } catch (error) {
      console.error("🔒 2FA toggle error:", error);
    }
  };

  if (loading) return <p className="loading">🔄 Loading admin panel...</p>;

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
      <h1>👑 Admin Panel</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {/* 2FA Valdymas */}
      <h3>🔐 2FA Authentication</h3>
      <button onClick={toggle2FA}>
        {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
      </button>

      {/* Ban/Unban */}
      <h3>🚫 Ban Users</h3>
      <input
        type="text"
        placeholder="Enter wallet address..."
        value={newBanAddress}
        onChange={(e) => setNewBanAddress(e.target.value)}
      />
      <button onClick={() => handleBanUnban(newBanAddress, true)}>Ban User</button>

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>User Address</th>
            <th>Status</th>
            <th>Ban/Unban</th>
            <th>Freeze/Unfreeze</th>
            <th>Refund</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr key={user.address}>
              <td>{user.address}</td>
              <td>{user.isBanned ? "🚫 Banned" : "✅ Active"}</td>
              <td>
                <button
                  className={user.isBanned ? "unban-btn" : "ban-btn"}
                  onClick={() => handleBanUnban(user.address, !user.isBanned)}
                >
                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              </td>
              <td>
                <button
                  className={user.isFrozen ? "unfreeze-btn" : "freeze-btn"}
                  onClick={() => handleFreezeUnfreeze(user.address, !user.isFrozen)}
                >
                  {user.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </td>
              <td>
                <button
                  className="refund-btn"
                  onClick={() => handleRefund(user.address, 0.1)}
                >
                  💸 Refund
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Security Logs */}
      <h3>📜 Security Logs</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default Admin;
