import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const Security = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [frozenBalances, setFrozenBalances] = useState([]);
  const [logs, setLogs] = useState([]);
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;

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

  // 📌 Ban vartotoją
  const banUser = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    if (!Web3.utils.isAddress(userAddress)) return alert("❌ Invalid address!");

    setBannedUsers([...bannedUsers, userAddress.toLowerCase()]);
    logAction(`🚨 Banned user: ${userAddress}`);
  };

  // 📌 Unban vartotoją
  const unbanUser = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    
    setBannedUsers(bannedUsers.filter(addr => addr !== userAddress.toLowerCase()));
    logAction(`✅ Unbanned user: ${userAddress}`);
  };

  // 📌 Freeze lėšas
  const freezeFunds = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    
    setFrozenBalances([...frozenBalances, userAddress.toLowerCase()]);
    logAction(`❄️ Funds frozen for: ${userAddress}`);
  };

  // 📌 Unfreeze lėšas
  const unfreezeFunds = (userAddress) => {
    if (!isAdmin) return alert("❌ Access denied!");
    
    setFrozenBalances(frozenBalances.filter(addr => addr !== userAddress.toLowerCase()));
    logAction(`🔥 Funds unfrozen for: ${userAddress}`);
  };

  // 📌 Logų saugojimas
  const logAction = (message) => {
    const newLogs = [...logs, `[${new Date().toLocaleString()}] ${message}`];
    setLogs(newLogs);
    localStorage.setItem("security_logs", JSON.stringify(newLogs));
  };

  return (
    <div className="security-container">
      <h1>🛡️ Security Panel</h1>
      <p className="admin-status">🔑 {isAdmin ? "Admin Access ✅" : "Restricted Access ❌"}</p>

      {/* BAN / UNBAN */}
      <div className="security-section">
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
      <div className="security-section">
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

      {/* SECURITY LOGS */}
      <div className="security-section">
        <h2>📜 Security Logs</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Security;
