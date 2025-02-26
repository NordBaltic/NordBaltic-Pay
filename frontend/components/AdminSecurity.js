import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminSecurity() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFTWMode, setIsFTWMode] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [serverStatus, setServerStatus] = useState("Checking...");
  const [nodeStatus, setNodeStatus] = useState("Checking...");
  const [systemHealth, setSystemHealth] = useState({ uptime: "Loading...", load: "Loading..." });
  const [logs, setLogs] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [newBanAddress, setNewBanAddress] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          if (accounts[0].toLowerCase() === adminWallet) {
            setIsAdmin(true);
            fetchSecurityData();
          }
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // 🔄 Gauti būsenas iš Supabase
      const { data: settings } = await supabase.from("admin_settings").select("*").single();
      if (settings) {
        setIsFTWMode(settings.ftw_mode);
        setIs2FAEnabled(settings.two_factor);
      }

      // 🔄 Gauti užblokuotus vartotojus
      const { data: bannedUsersData } = await supabase.from("banned_users").select("*");
      setBannedUsers(bannedUsersData || []);

      // 🔄 Gauti prisijungimus
      const { data: loginData } = await supabase.from("recent_logins").select("*").order("timestamp", { ascending: false }).limit(10);
      setRecentLogins(loginData || []);

      // 🔄 Gauti saugumo log'us
      const { data: logsData } = await supabase.from("security_logs").select("*").order("timestamp", { ascending: false }).limit(10);
      setLogs(logsData || []);
    } catch (error) {
      console.error("⚠️ Security data fetch error:", error);
    }
  };

  const toggleFTWMode = async () => {
    try {
      const updatedStatus = !isFTWMode;
      await supabase.from("admin_settings").update({ ftw_mode: updatedStatus }).eq("id", 1);
      setIsFTWMode(updatedStatus);
    } catch (error) {
      console.error("⚠️ FTW Mode toggle error:", error);
    }
  };

  const toggle2FA = async () => {
    try {
      const updatedStatus = !is2FAEnabled;
      await supabase.from("admin_settings").update({ two_factor: updatedStatus }).eq("id", 1);
      setIs2FAEnabled(updatedStatus);
    } catch (error) {
      console.error("⚠️ 2FA toggle error:", error);
    }
  };

  const handleBanUnban = async (userAddress, isBanned) => {
    try {
      if (isBanned) {
        await supabase.from("banned_users").insert([{ address: userAddress }]);
      } else {
        await supabase.from("banned_users").delete().eq("address", userAddress);
      }
      fetchSecurityData();
    } catch (error) {
      console.error("❌ Error updating user status:", error);
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
    <div className="admin-security glass-card">
      <h2>🛡️ Security & System Health</h2>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {/* 🔥 FTW & 2FA CONTROL */}
      <div className="security-controls">
        <div className="status-card">
          <h3>🔥 FTW Mode</h3>
          <p>Status: {isFTWMode ? "🟢 Enabled" : "🔴 Disabled"}</p>
          <button className={`toggle-ftw ${isFTWMode ? "active" : ""}`} onClick={toggleFTWMode}>
            {isFTWMode ? "🛑 Disable FTW Mode" : "✅ Enable FTW Mode"}
          </button>
        </div>

        <div className="status-card">
          <h3>🔐 2FA Authentication</h3>
          <p>Status: {is2FAEnabled ? "🟢 Enabled" : "🔴 Disabled"}</p>
          <button className={`toggle-2fa ${is2FAEnabled ? "active" : ""}`} onClick={toggle2FA}>
            {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
          </button>
        </div>
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

        <h4>🚨 Banned Users</h4>
        <ul>
          {bannedUsers.map((user) => (
            <li key={user.address}>
              {user.address} - {user.isBanned ? "❌ Banned" : "✅ Active"}
            </li>
          ))}
        </ul>
      </div>

      {/* 👤 Recent Logins */}
      <div className="section">
        <h3>👤 Recent Logins</h3>
        <ul>
          {recentLogins.map((login) => (
            <li key={login.wallet}>
              {login.wallet} - {new Date(login.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
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
    </div>
  );
}
