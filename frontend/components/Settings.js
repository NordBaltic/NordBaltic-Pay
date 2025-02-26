import { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeContext";
import axios from "axios";
import "../styles/globals.css";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "EUR");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => {
    // Fetch current security settings from API
    const fetchSecuritySettings = async () => {
      try {
        const response = await axios.get("/api/security/settings");
        setIs2FAEnabled(response.data.is2FAEnabled);
        setNotificationsEnabled(response.data.notificationsEnabled);
        setAutoLogout(response.data.autoLogout);
      } catch (error) {
        console.error("⚠️ Error fetching security settings:", error);
      }
    };

    fetchSecuritySettings();
  }, []);

  const toggle2FA = async () => {
    try {
      await axios.post("/api/security/toggle-2fa", { enable: !is2FAEnabled });
      setIs2FAEnabled(!is2FAEnabled);
      setStatusMessage(`✅ 2FA ${is2FAEnabled ? "disabled" : "enabled"} successfully.`);
    } catch (error) {
      console.error("❌ Error toggling 2FA:", error);
      setStatusMessage("❌ 2FA update failed.");
    }
  };

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    setStatusMessage(`✅ Notifications ${notificationsEnabled ? "disabled" : "enabled"}.`);
  };

  const toggleAutoLogout = async () => {
    setAutoLogout(!autoLogout);
    setStatusMessage(`✅ Auto Logout ${autoLogout ? "disabled" : "enabled"}.`);
  };

  return (
    <div className="settings-container">
      <h1>⚙️ User Settings</h1>

      {/* Theme Switcher */}
      <div className="settings-section">
        <h3>🌙 Theme</h3>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="theme-toggle-btn">
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Currency Selection */}
      <div className="settings-section">
        <h3>💰 Currency Preference</h3>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="currency-select">
          <option value="EUR">💶 EUR</option>
          <option value="USD">💵 USD</option>
        </select>
      </div>

      {/* Security Settings */}
      <div className="settings-section">
        <h3>🔒 Security</h3>
        <button onClick={toggle2FA} className="security-btn">
          {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
        </button>
      </div>

      {/* Notifications Settings */}
      <div className="settings-section">
        <h3>🔔 Notifications</h3>
        <button onClick={toggleNotifications} className="notification-btn">
          {notificationsEnabled ? "🔕 Disable Notifications" : "🔔 Enable Notifications"}
        </button>
      </div>

      {/* Auto Logout */}
      <div className="settings-section">
        <h3>⏳ Auto Logout</h3>
        <button onClick={toggleAutoLogout} className="auto-logout-btn">
          {autoLogout ? "🛑 Disable Auto Logout" : "✅ Enable Auto Logout"}
        </button>
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
};

export default Settings;
