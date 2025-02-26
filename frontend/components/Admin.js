import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const Admin = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [swapFee, setSwapFee] = useState("");
  const [sendFee, setSendFee] = useState("");
  const [donationFee, setDonationFee] = useState("");
  const [stakingDepositFee, setStakingDepositFee] = useState("");
  const [stakingWithdrawFee, setStakingWithdrawFee] = useState("");
  const [adminWallet, setAdminWallet] = useState(process.env.NEXT_PUBLIC_ADMIN_WALLET);
  const [stakeWallet, setStakeWallet] = useState(process.env.NEXT_PUBLIC_STAKE_WALLET);
  const [donationWallet, setDonationWallet] = useState(process.env.NEXT_PUBLIC_DONATION_WALLET);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [frozenBalances, setFrozenBalances] = useState([]);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const isAdmin = account && account.toLowerCase() === adminWallet.toLowerCase();

  // 🔹 Ban/Unban
  const banUser = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    setBannedUsers([...bannedUsers, userAddress.toLowerCase()]);
  };

  const unbanUser = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    setBannedUsers(bannedUsers.filter(addr => addr !== userAddress.toLowerCase()));
  };

  // 🔹 Freeze/Unfreeze Funds
  const freezeFunds = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    setFrozenBalances([...frozenBalances, userAddress.toLowerCase()]);
  };

  const unfreezeFunds = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    setFrozenBalances(frozenBalances.filter(addr => addr !== userAddress.toLowerCase()));
  };

  // 🔹 Update Fees
  const updateFee = async (type, value) => {
    if (!isAdmin) return alert("❌ Access denied!");
    switch (type) {
      case "swap": setSwapFee(value); break;
      case "send": setSendFee(value); break;
      case "donation": setDonationFee(value); break;
      case "stakingDeposit": setStakingDepositFee(value); break;
      case "stakingWithdraw": setStakingWithdrawFee(value); break;
      default: break;
    }
    alert(`✅ ${type} Fee Updated to ${value}%`);
  };

  return (
    <div className="admin-container">
      <h1>🛡️ Admin Panel</h1>
      <p className="admin-status">🔑 {isAdmin ? "Admin Access ✅" : "Restricted Access ❌"}</p>

      {/* Fees Management */}
      <div className="admin-section">
        <h2>⚙️ Fees Management</h2>
        <label>Swap Fee (%):</label>
        <input type="number" value={swapFee} onChange={(e) => updateFee("swap", e.target.value)} />
        
        <label>Send Fee (%):</label>
        <input type="number" value={sendFee} onChange={(e) => updateFee("send", e.target.value)} />

        <label>Donation Fee (%):</label>
        <input type="number" value={donationFee} onChange={(e) => updateFee("donation", e.target.value)} />

        <label>Staking Deposit Fee (%):</label>
        <input type="number" value={stakingDepositFee} onChange={(e) => updateFee("stakingDeposit", e.target.value)} />

        <label>Staking Withdraw Fee (%):</label>
        <input type="number" value={stakingWithdrawFee} onChange={(e) => updateFee("stakingWithdraw", e.target.value)} />
      </div>

      {/* BAN / UNBAN */}
      <div className="admin-section">
        <h2>🚨 Ban / Unban Users</h2>
        <input type="text" placeholder="Enter wallet address" id="banAddress" />
        <button onClick={() => banUser(document.getElementById("banAddress").value)}>Ban</button>
        <button onClick={() => unbanUser(document.getElementById("banAddress").value)}>Unban</button>
        <ul>
          {bannedUsers.map((user) => (
            <li key={user}>🚫 {user}</li>
          ))}
        </ul>
      </div>

      {/* FREEZE / UNFREEZE */}
      <div className="admin-section">
        <h2>❄️ Freeze / Unfreeze Funds</h2>
        <input type="text" placeholder="Enter wallet address" id="freezeAddress" />
        <button onClick={() => freezeFunds(document.getElementById("freezeAddress").value)}>Freeze</button>
        <button onClick={() => unfreezeFunds(document.getElementById("freezeAddress").value)}>Unfreeze</button>
        <ul>
          {frozenBalances.map((user) => (
            <li key={user}>❄️ {user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
