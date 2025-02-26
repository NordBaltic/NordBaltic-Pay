import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const Security = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userList, setUserList] = useState([]);
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

          fetchUsers();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
      setLoading(false);
    };

    loadAccount();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users"); // 🔹 Pakeisti su realiu API
      setUserList(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  const handleBanUnban = async (userAddress, isBanned) => {
    try {
      await axios.post("/api/admin/ban", { userAddress, isBanned }); // 🔹 API sujungimas
      setStatusMessage(`✅ User ${isBanned ? "banned" : "unbanned"} successfully.`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      setStatusMessage("❌ Error processing request.");
    }
  };

  const handleFreezeUnfreeze = async (userAddress, isFrozen) => {
    try {
      await axios.post("/api/admin/freeze", { userAddress, isFrozen }); // 🔹 API sujungimas
      setStatusMessage(`✅ Funds ${isFrozen ? "frozen" : "unfrozen"} successfully.`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error updating funds status:", error);
      setStatusMessage("❌ Error processing request.");
    }
  };

  const handleRefund = async (userAddress, amount) => {
    try {
      await axios.post("/api/admin/refund", { userAddress, amount }); // 🔹 API sujungimas
      setStatusMessage(`✅ Refunded ${amount} BNB to ${userAddress}`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error processing refund:", error);
      setStatusMessage("❌ Refund failed.");
    }
  };

  if (loading) return <p className="loading">🔄 Loading security panel...</p>;

  if (!isAdmin) {
    return (
      <div className="security-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="security-container">
      <h1>🛡️ Security & User Management</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

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
                  onClick={() => handleRefund(user.address, 0.1)} // 🔹 Pakeisti su realiu įvedimu
                >
                  💸 Refund
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default Security;
