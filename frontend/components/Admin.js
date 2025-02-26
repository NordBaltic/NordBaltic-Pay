import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [userList, setUserList] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [freezeList, setFreezeList] = useState([]);
  const [adminWallet, setAdminWallet] = useState(process.env.NEXT_PUBLIC_ADMIN_WALLET);

  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAccount");
    if (storedAccount) {
      setAccount(storedAccount);
      initializeWeb3();
    }
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/api/users`);
      setUserList(response.data.users);
      setBannedUsers(response.data.bannedUsers);
      setFreezeList(response.data.frozenAccounts);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const banUser = async (user) => {
    try {
      await axios.post(`/api/ban`, { user });
      setBannedUsers([...bannedUsers, user]);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const unbanUser = async (user) => {
    try {
      await axios.post(`/api/unban`, { user });
      setBannedUsers(bannedUsers.filter((u) => u !== user));
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };

  const freezeFunds = async (user) => {
    try {
      await axios.post(`/api/freeze`, { user });
      setFreezeList([...freezeList, user]);
    } catch (error) {
      console.error("Error freezing funds:", error);
    }
  };

  const unfreezeFunds = async (user) => {
    try {
      await axios.post(`/api/unfreeze`, { user });
      setFreezeList(freezeList.filter((u) => u !== user));
    } catch (error) {
      console.error("Error unfreezing funds:", error);
    }
  };

  const transferFunds = async (to, amount) => {
    try {
      if (!web3) return;
      const value = web3.utils.toWei(amount, "ether");
      await web3.eth.sendTransaction({
        from: adminWallet,
        to,
        value,
      });
      alert(`✅ Successfully transferred ${amount} BNB to ${to}`);
    } catch (error) {
      console.error("Error transferring funds:", error);
      alert("❌ Transaction failed");
    }
  };

  return (
    <div className="admin-container">
      <h2>🔧 Admin Control Panel</h2>
      
      {/* Ban/Unban */}
      <div className="admin-section">
        <h3>🚫 Ban/Unban Users</h3>
        {userList.map((user) => (
          <div key={user} className="user-item">
            <span>{user}</span>
            {bannedUsers.includes(user) ? (
              <button className="unban-btn" onClick={() => unbanUser(user)}>✅ Unban</button>
            ) : (
              <button className="ban-btn" onClick={() => banUser(user)}>🚫 Ban</button>
            )}
          </div>
        ))}
      </div>

      {/* Freeze/Unfreeze Funds */}
      <div className="admin-section">
        <h3>🧊 Freeze/Unfreeze Funds</h3>
        {userList.map((user) => (
          <div key={user} className="user-item">
            <span>{user}</span>
            {freezeList.includes(user) ? (
              <button className="unfreeze-btn" onClick={() => unfreezeFunds(user)}>✅ Unfreeze</button>
            ) : (
              <button className="freeze-btn" onClick={() => freezeFunds(user)}>🧊 Freeze</button>
            )}
          </div>
        ))}
      </div>

      {/* Transfer Funds */}
      <div className="admin-section">
        <h3>💸 Transfer Funds</h3>
        <input type="text" placeholder="Recipient Address" id="recipient" />
        <input type="number" placeholder="Amount (BNB)" id="amount" />
        <button 
          className="transfer-btn"
          onClick={() => transferFunds(
            document.getElementById("recipient").value, 
            document.getElementById("amount").value
          )}
        >
          🚀 Send Funds
        </button>
      </div>
    </div>
  );
}
