import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";
import { motion } from "framer-motion"; // Animacijos

const Settings = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "EN");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          fetchUserSettings();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      setIs2FAEnabled(response.data.is2FAEnabled);
      setLoginHistory(response.data.loginHistory);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("❌ Error fetching user settings:", error);
    }
  };

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const handle2FAToggle = async () => {
    try {
      await axios.post("/api/settings/toggle-2fa");
      setIs2FAEnabled(!is2FAEnabled);
    } catch (error) {
      console.error("🔒 2FA toggle error:", error);
    }
  };

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <motion.div className="settings-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>⚙️ Settings</h1>
      <p className="user-account">👤 Connected: {account}</p>

      {/* Tema */}
      <h3>🎨 Theme</h3>
      <button onClick={handleThemeChange}>
        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Kalba */}
      <h3>🌍 Language</h3>
      <select value={language} onChange={handleLanguageChange}>
        <option value="EN">🇬🇧 English</option>
        <option value="LT">🇱🇹 Lietuvių</option>
        <option value="DE">🇩🇪 Deutsch</option>
        <option value="FR">🇫🇷 Français</option>
        <option value="ES">🇪🇸 Español</option>
      </select>

      {/* 2FA */}
      <h3>🔐 2FA Authentication</h3>
      <button onClick={handle2FAToggle}>
        {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
      </button>

      {/* Pranešimai */}
      <h3>🔔 Notifications</h3>
      <label>
        <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationChange("email")} />
        📧 Email
      </label>
      <label>
        <input type="checkbox" checked={notifications.sms} onChange={() => handleNotificationChange("sms")} />
        📱 SMS
      </label>
      <label>
        <input type="checkbox" checked={notifications.push} onChange={() => handleNotificationChange("push")} />
        📲 Push Notifications
      </label>

      {/* Prisijungimo istorija */}
      <h3>📜 Login History</h3>
      <ul>
        {loginHistory.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Settings;
