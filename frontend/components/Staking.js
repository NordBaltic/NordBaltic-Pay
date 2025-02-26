import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import QRCode from "qrcode.react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Select, MenuItem, Snackbar, Alert, CircularProgress } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Staking() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [stakedBalance, setStakedBalance] = useState("0.00");
  const [rewards, setRewards] = useState("0.00");
  const [apy, setApy] = useState("0.00%");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const stakingContract = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchUserAccount();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchStakingData();
      fetchApy();
    }
  }, [account]);

  // 🔵 Fetch user account from Supabase
  const fetchUserAccount = async () => {
    const { data } = await supabase.from("users").select("wallet").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
    }
  };

  // 📊 Fetch staking data from Supabase
  const fetchStakingData = async () => {
    if (!account) return;
    
    const { data, error } = await supabase.from("stake").select("staked_amount, rewards").eq("wallet", account).single();
    if (data) {
      setStakedBalance(data.staked_amount || "0.00");
      setRewards(data.rewards || "0.00");
    }
    if (error) console.error("🔴 Klaida gaunant staking duomenis:", error);
  };

  // 🔄 Fetch APY
  const fetchApy = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_STAKING_PROVIDER_URL}/apy`);
      setApy(`${response.data.apy}%`);
    } catch (error) {
      console.error("❌ Klaida gaunant APY:", error);
    }
  };

  // 🚀 Stake function with fee tracking in Supabase
  const handleStake = async () => {
    if (!amount || !web3) return;

    try {
      setLoading(true);
      const sendAmount = web3.utils.toWei(amount, "ether");

      // Send staking transaction
      await web3.eth.sendTransaction({
        from: account,
        to: stakingContract,
        value: sendAmount,
        gas: 21000,
      });

      // Update staking data in Supabase
      await supabase.from("stake").upsert({
        wallet: account,
        staked_amount: parseFloat(stakedBalance) + parseFloat(amount),
        rewards: (parseFloat(rewards) + parseFloat(amount) * 0.1).toFixed(4),
      });

      setNotifications((prev) => [`🚀 Successfully staked ${amount} BNB`, ...prev]);
      fetchStakingData();
    } catch (error) {
      console.error("❌ Klaida staking procese:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="staking-container p-6 glass-card">
      {notifications.length > 0 && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="success">{notifications[0]}</Alert>
        </Snackbar>
      )}

      <Typography variant="h4" className="text-center mb-6 neon-text">💸 Staking</Typography>

      <Card className="glass-card mb-6">
        <CardContent>
          <Typography variant="h5">🌟 APY: {apy}</Typography>
          <Typography variant="body1">Stake your BNB and earn passive income.</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h5">💰 Staked Balance</Typography>
              <Typography variant="h4">{stakedBalance} BNB</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card className="glass-card">
            <CardContent>
              <Typography variant="h5">🏆 Earned Rewards</Typography>
              <Typography variant="h4">{rewards} BNB</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TextField fullWidth label="Amount to Stake (BNB)" type="number" variant="outlined" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-4" />
      
      <Button variant="contained" color="primary" fullWidth className="mt-4" onClick={handleStake} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "🚀 Stake"}
      </Button>

      {account && <QRCode value={account} size={128} className="mt-6" />}
    </motion.div>
  );
      }
