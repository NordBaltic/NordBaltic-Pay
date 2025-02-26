import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Box, Card, CardContent, Typography, Button, Grid,
  Snackbar, Alert, Switch, CircularProgress
} from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminControls() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [authDisabled, setAuthDisabled] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    loadAccount();
    fetchAdminData();
    subscribeToChanges();
  }, []);

  const loadAccount = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
        setIsAdmin(accounts[0].toLowerCase() === adminWallet);
      } catch (error) {
        console.error("🔴 MetaMask connection error:", error);
      }
    }
  };

  const fetchAdminData = async () => {
    try {
      const { data, error } = await supabase.from("admin_settings").select("*").single();
      if (error) throw error;
      setIs2FAEnabled(data.is2FAEnabled);
      setAuthDisabled(data.authDisabled);
      setLoading(false);
    } catch (error) {
      console.error("⚠️ Admin data fetch error:", error);
    }
  };

  const subscribeToChanges = () => {
    supabase.channel("admin_settings")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "admin_settings" }, (payload) => {
        setIs2FAEnabled(payload.new.is2FAEnabled);
        setAuthDisabled(payload.new.authDisabled);
        setNotification("⚡ Settings updated in real-time!");
      })
      .subscribe();
  };

  const toggleAuth = async () => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .update({ authDisabled: !authDisabled })
        .eq("id", 1);
      if (error) throw error;
      setAuthDisabled(!authDisabled);
      setNotification(`✅ Authentication ${authDisabled ? "Enabled" : "Disabled"}!`);
    } catch (error) {
      console.error("❌ Error toggling authentication:", error);
    }
  };

  const toggle2FA = async () => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .update({ is2FAEnabled: !is2FAEnabled })
        .eq("id", 1);
      if (error) throw error;
      setIs2FAEnabled(!is2FAEnabled);
    } catch (error) {
      console.error("🔒 2FA toggle error:", error);
    }
  };

  if (!isAdmin) {
    return (
      <Box className="admin-controls">
        <Typography variant="h4" className="text-center">🚨 Access Denied</Typography>
        <Typography variant="body1" className="text-center">🔒 You are not authorized to view this section.</Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-container p-6">
      <Typography variant="h4" className="text-center neon-text">⚙️ Admin Controls</Typography>

      {/* 🔐 2FA Valdymas */}
      <Card className="glass-card mt-4 p-4">
        <Typography variant="h5">🔐 2FA Authentication</Typography>
        <Switch checked={is2FAEnabled} onChange={toggle2FA} />
        <Typography variant="body2">{is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}</Typography>
      </Card>

      {/* 🚀 FTW MODE - Disable Authentication */}
      <Card className={`glass-card mt-4 p-4 ${authDisabled ? "error-bg" : ""}`}>
        <Typography variant="h5">🚀 FTW Mode: Disable Authentication</Typography>
        <Switch checked={authDisabled} onChange={toggleAuth} />
        <Typography variant="body2" className={authDisabled ? "text-red-500" : "text-green-500"}>
          {authDisabled ? "🛑 Authentication Disabled (FTW Mode)" : "✅ Authentication Enabled"}
        </Typography>
      </Card>

      {/* 📜 Security Logs */}
      <Card className="glass-card mt-4 p-4">
        <Typography variant="h5">📜 Security Logs</Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Box className="security-logs">
            {logs.slice(0, 5).map((log, index) => (
              <Typography key={index} variant="body2">{log.action} - {new Date(log.timestamp).toLocaleString()}</Typography>
            ))}
          </Box>
        )}
      </Card>

      {/* Snackbar Notifications */}
      <Snackbar open={!!notification} autoHideDuration={4000} onClose={() => setNotification("")}>
        <Alert severity="info">{notification}</Alert>
      </Snackbar>
    </Box>
  );
}
