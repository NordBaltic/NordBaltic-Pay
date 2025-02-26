import { useState, useEffect } from "react";
import { useTheme } from "../components/ThemeContext";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import "../styles/globals.css";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "EUR");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoLogout, setAutoLogout] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await axios.get("/api/security/settings");
        setIs2FAEnabled(response.data.is2FAEnabled);
        setNotificationsEnabled(response.data.notificationsEnabled);
        setAutoLogout(response.data.autoLogout);
      } catch (error) {
        console.error("⚠️ Error fetching security settings:", error);
      }
      setLoading(false);
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
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="settings-container p-6 glass-card">
      {statusMessage && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="success">{statusMessage}</Alert>
        </Snackbar>
      )}

      <Typography variant="h4" className="text-center mb-6 neon-text">⚙️ User Settings</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Theme Switcher */}
          <Card className="glass-card mt-4">
            <CardContent>
              <Typography variant="h5">🌙 Theme</Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="theme-toggle-btn mt-2"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </Button>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          <Card className="glass-card mt-4">
            <CardContent>
              <Typography variant="h5">💰 Currency Preference</Typography>
              <Select fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-2">
                <MenuItem value="EUR">💶 EUR</MenuItem>
                <MenuItem value="USD">💵 USD</MenuItem>
              </Select>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass-card mt-4">
            <CardContent>
              <Typography variant="h5">🔒 Security</Typography>
              <Button variant="contained" fullWidth onClick={toggle2FA} className="security-btn mt-2">
                {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="glass-card mt-4">
            <CardContent>
              <Typography variant="h5">🔔 Notifications</Typography>
              <Button variant="contained" fullWidth onClick={toggleNotifications} className="notification-btn mt-2">
                {notificationsEnabled ? "🔕 Disable Notifications" : "🔔 Enable Notifications"}
              </Button>
            </CardContent>
          </Card>

          {/* Auto Logout */}
          <Card className="glass-card mt-4">
            <CardContent>
              <Typography variant="h5">⏳ Auto Logout</Typography>
              <Button variant="contained" fullWidth onClick={toggleAutoLogout} className="auto-logout-btn mt-2">
                {autoLogout ? "🛑 Disable Auto Logout" : "✅ Enable Auto Logout"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default Settings;
