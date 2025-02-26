import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Box, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Security() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userList, setUserList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [newBanAddress, setNewBanAddress] = useState("");
  const [securityAlert, setSecurityAlert] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchUserAccount();
    listenForSecurityEvents();
  }, []);

  const fetchUserAccount = async () => {
    const { data } = await supabase.from("users").select("wallet").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
      setIsAdmin(data.wallet === process.env.NEXT_PUBLIC_ADMIN_WALLET);
      fetchSecurityData();
    }
  };

  const fetchSecurityData = async () => {
    try {
      const { data } = await supabase.from("security_logs").select("*");
      if (data) {
        setLogs(data);
      }
    } catch (error) {
      console.error("❌ Klaida gaunant saugumo duomenis:", error);
    }
  };

  const handleBanUnban = async (userAddress, isBanned) => {
    try {
      await supabase.from("users").update({ isBanned }).eq("wallet", userAddress);
      setStatusMessage(`✅ User ${isBanned ? "banned" : "unbanned"} successfully.`);
      fetchSecurityData();
    } catch (error) {
      console.error("❌ Klaida ban/unban:", error);
    }
  };

  const handleToggle2FA = async () => {
    try {
      await supabase.from("security_settings").update({ is2FAEnabled: !is2FAEnabled }).match({ id: 1 });
      setIs2FAEnabled(!is2FAEnabled);
      setStatusMessage(`✅ 2FA ${!is2FAEnabled ? "Enabled" : "Disabled"}`);
    } catch (error) {
      console.error("❌ Klaida įjungiant/išjungiant 2FA:", error);
    }
  };

  const listenForSecurityEvents = async () => {
    supabase
      .channel("security_logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "security_logs" }, (payload) => {
        setSecurityAlert(true);
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();
  };

  if (!isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="security-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="security-container p-6 glass-card">
      <Typography variant="h4" className="text-center mb-6 neon-text">🛡️ Security & User Management</Typography>

      <Snackbar open={securityAlert} autoHideDuration={6000} onClose={() => setSecurityAlert(false)}>
        <Alert severity="warning">⚠️ Suspicious activity detected!</Alert>
      </Snackbar>

      <Box className="admin-controls">
        <Typography variant="h5">🔐 2FA Authentication</Typography>
        <Button variant="contained" onClick={handleToggle2FA} className="mt-2">
          {is2FAEnabled ? "🛑 Disable 2FA" : "✅ Enable 2FA"}
        </Button>
      </Box>

      <Box className="ban-controls mt-6">
        <Typography variant="h5">🚫 Ban Users</Typography>
        <TextField fullWidth label="Enter wallet address" value={newBanAddress} onChange={(e) => setNewBanAddress(e.target.value)} className="mt-2" />
        <Button variant="contained" onClick={() => handleBanUnban(newBanAddress, true)} className="mt-2">
          Ban User
        </Button>
      </Box>

      <TableContainer component={Paper} className="glass-card mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.wallet}>
                <TableCell>{user.wallet}</TableCell>
                <TableCell>{user.isBanned ? "🚫 Banned" : "✅ Active"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleBanUnban(user.wallet, !user.isBanned)} variant="contained">
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box className="logs mt-6">
        <Typography variant="h5">📜 Security Logs</Typography>
        <TableContainer component={Paper} className="glass-card mt-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Event</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.event}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {statusMessage && <Typography variant="h6" className="status-message mt-4">{statusMessage}</Typography>}
    </motion.div>
  );
      }
