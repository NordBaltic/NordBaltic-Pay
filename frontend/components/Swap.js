import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Box, Card, CardContent, Typography, Button, Select, MenuItem, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

export default function Swap({ account, web3, onTransactionComplete }) {
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("BNB");
  const [swapTo, setSwapTo] = useState("USDT");
  const [balanceFrom, setBalanceFrom] = useState("0.00");
  const [swapRate, setSwapRate] = useState(null);
  const [swapProcessing, setSwapProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const tokenList = [
    { symbol: "BNB", address: "0x..." },
    { symbol: "USDT", address: "0x..." },
    { symbol: "ETH", address: "0x..." },
    { symbol: "BTCB", address: "0x..." },
  ];

  useEffect(() => {
    if (account && web3) {
      fetchBalance(swapFrom);
      fetchSwapRate();
    }
  }, [account, web3, swapFrom]);

  const fetchBalance = async (token) => {
    try {
      if (token === "BNB") {
        const balanceWei = await web3.eth.getBalance(account);
        setBalanceFrom(web3.utils.fromWei(balanceWei, "ether"));
      }
    } catch (error) {
      console.error(`🔴 Error fetching ${token} balance:`, error);
    }
  };

  const fetchSwapRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${swapFrom.toLowerCase()},${swapTo.toLowerCase()}&vs_currencies=usd`);
      setSwapRate(response.data[swapFrom.toLowerCase()].usd / response.data[swapTo.toLowerCase()].usd);
    } catch (error) {
      console.error("🔴 Error fetching swap rate:", error);
    }
  };

  const executeSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setNotification("❌ Enter a valid amount!");
      return;
    }

    if (parseFloat(swapAmount) > parseFloat(balanceFrom)) {
      setNotification("🚨 Insufficient balance!");
      return;
    }

    setSwapProcessing(true);

    try {
      const sendAmount = web3.utils.toWei(swapAmount, "ether");
      const feeAmount = (parseFloat(swapAmount) * 0.002).toFixed(6);
      const feeWei = web3.utils.toWei(feeAmount, "ether");

      await web3.eth.sendTransaction({
        from: account,
        to: WALLET_CONTRACT_ADDRESS,
        value: feeWei,
        gas: 21000,
      });

      await supabase.from("swaps").insert([
        {
          wallet: account,
          from_token: swapFrom,
          to_token: swapTo,
          amount: swapAmount,
          swap_rate: swapRate.toFixed(6),
          fee: feeAmount,
          status: "Success",
          timestamp: new Date().toISOString(),
        }
      ]);

      setNotification(`✅ Swap successful! ${swapAmount} ${swapFrom} → ${swapTo}`);
      onTransactionComplete();
    } catch (error) {
      console.error("❌ Swap error:", error);

      await supabase.from("swaps").insert([
        {
          wallet: account,
          from_token: swapFrom,
          to_token: swapTo,
          amount: swapAmount,
          swap_rate: swapRate ? swapRate.toFixed(6) : "N/A",
          fee: "N/A",
          status: "Failed",
          timestamp: new Date().toISOString(),
        }
      ]);

      setNotification("❌ Swap failed!");
    }

    setSwapProcessing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="swap-container p-6 glass-card">
      {notification && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity={notification.includes("failed") ? "error" : "success"}>{notification}</Alert>
        </Snackbar>
      )}

      <Typography variant="h4" className="text-center mb-6 neon-text">🔄 Swap Tokens</Typography>

      <Card className="glass-card p-6">
        <CardContent>
          <Typography variant="h6" className="text-white">💰 Balance: {balanceFrom} {swapFrom}</Typography>

          <Select fullWidth value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} className="mt-2">
            {tokenList.map(token => (
              <MenuItem key={token.symbol} value={token.symbol}>{token.symbol}</MenuItem>
            ))}
          </Select>

          <Typography variant="h6" className="mt-4 text-white">🔄 Convert to:</Typography>
          <Select fullWidth value={swapTo} onChange={(e) => setSwapTo(e.target.value)} className="mt-2">
            {tokenList.map(token => (
              <MenuItem key={token.symbol} value={token.symbol}>{token.symbol}</MenuItem>
            ))}
          </Select>

          <TextField fullWidth label="Amount (BNB)" type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="mt-4" />

          {swapRate && <Typography variant="h6" className="mt-4 text-white">1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}</Typography>}

          <Button 
            variant="contained" 
            fullWidth 
            className="swap-btn mt-6"
            onClick={executeSwap}
            disabled={swapProcessing || !swapAmount || parseFloat(swapAmount) > parseFloat(balanceFrom)}
          >
            {swapProcessing ? <CircularProgress size={24} /> : "⚡ Swap Now"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
