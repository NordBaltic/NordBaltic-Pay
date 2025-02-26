import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import QRCode from "qrcode.react";
import { createClient } from "@supabase/supabase-js";
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
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const stakeWallet = process.env.NEXT_PUBLIC_STAKE_WALLET;
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

  // 📊 Fetch staking data from „Supabase“
  const fetchStakingData = async () => {
    if (!account) return;
    
    const { data, error } = await supabase.from("stake").select("staked_amount, rewards").eq("wallet", account).single();
    if (error) {
      console.error("🔴 Klaida gaunant staking duomenis:", error);
      return;
    }
    
    if (data) {
      setStakedBalance(data.staked_amount || "0.00");
      setRewards(data.rewards || "0.00");
    }
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

  // 💵 Currency Conversion
  useEffect(() => {
    if (!amount) return;
    const convert = async () => {
      const rate = await fetchConversionRate();
      if (rate) {
        setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
      }
    };
    convert();
  }, [amount, currency]);

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

  // 🚀 Stake function with fee tracking in Supabase
  const handleStake = async () => {
    if (!amount || !web3) return;

    try {
      setLoading(true);
      const sendAmount = web3.utils.toWei(amount, "ether");
      const fee = web3.utils.toWei((parseFloat(amount) * 0.04).toFixed(4), "ether"); // 4% fee

      // Send staking transaction
      await web3.eth.sendTransaction({
        from: account,
        to: stakingContract,
        value: sendAmount - fee,
        gas: 21000,
      });

      // Send fee to staking pool
      await web3.eth.sendTransaction({
        from: account,
        to: stakeWallet,
        value: fee,
        gas: 21000,
      });

      // Update staking data in Supabase
      await supabase.from("stake").upsert({
        wallet: account,
        staked_amount: parseFloat(stakedBalance) + parseFloat(amount),
        rewards: (parseFloat(rewards) + parseFloat(amount) * 0.1).toFixed(4),
      });

      // 📌 Save staking fee in Supabase "fees" table
      await supabase.from("fees").insert([
        {
          wallet: account,
          transaction_hash: "staking",
          fee_amount: web3.utils.fromWei(fee, "ether"),
          currency: "BNB",
          timestamp: new Date().toISOString(),
        }
      ]);

      setNotifications((prev) => [`🚀 Successfully staked ${amount} BNB`, ...prev]);
      fetchStakingData();
    } catch (error) {
      console.error("❌ Klaida staking procese:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="staking-container p-6">
      <Typography variant="h4" className="text-center mb-6">💸 Staking</Typography>

      {notifications.length > 0 && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="success">{notifications[0]}</Alert>
        </Snackbar>
      )}

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
      <Select fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-4">
        <MenuItem value="EUR">💶 EUR</MenuItem>
        <MenuItem value="USD">💵 USD</MenuItem>
      </Select>
      {convertedAmount && <Typography variant="body2" className="mt-2">≈ {convertedAmount} {currency}</Typography>}

      <Button variant="contained" color="primary" fullWidth className="mt-4" onClick={handleStake} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "🚀 Stake"}
      </Button>

      {account && <QRCode value={account} size={128} className="mt-6" />}
    </Box>
  );
      }
