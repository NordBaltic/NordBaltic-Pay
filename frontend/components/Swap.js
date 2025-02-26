import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Box, Card, CardContent, Typography, Button, Select, MenuItem, TextField, CircularProgress } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 🔹 SMART CONTRACT ADRESAS IŠ `.env`
const WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

const Swap = ({ account, web3, onTransactionComplete }) => {
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("BNB");
  const [swapTo, setSwapTo] = useState("USDT");
  const [balanceFrom, setBalanceFrom] = useState("0.00");
  const [balanceTo, setBalanceTo] = useState("0.00");
  const [swapRate, setSwapRate] = useState(null);
  const [swapProcessing, setSwapProcessing] = useState(false);

  const tokenList = [
    { symbol: "BNB", address: "0x...", logo: "https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png" },
    { symbol: "USDT", address: "0x...", logo: "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png" },
    { symbol: "ETH", address: "0x...", logo: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
    { symbol: "BTCB", address: "0x...", logo: "https://assets.coingecko.com/coins/images/8256/thumb/binance-btc.png" },
  ];

  useEffect(() => {
    if (account && web3) {
      fetchBalance(swapFrom, setBalanceFrom);
      fetchBalance(swapTo, setBalanceTo);
      fetchSwapRate();
    }
  }, [account, web3, swapFrom, swapTo]);

  const fetchBalance = async (token, setBalance) => {
    try {
      if (token === "BNB") {
        const balanceWei = await web3.eth.getBalance(account);
        setBalance(web3.utils.fromWei(balanceWei, "ether"));
      } else {
        setBalance("0.00"); // ERC20 tokenų balansų funkcija vėliau
      }
    } catch (error) {
      console.error(`🔴 Klaida gaunant ${token} balansą:`, error);
    }
  };

  const fetchSwapRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${swapFrom.toLowerCase()},${swapTo.toLowerCase()}&vs_currencies=usd`);
      setSwapRate(response.data[swapFrom.toLowerCase()].usd / response.data[swapTo.toLowerCase()].usd);
    } catch (error) {
      console.error("🔴 Klaida gaunant swap kursą:", error);
    }
  };

  const executeSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert("❌ Įveskite teisingą sumą!");
      return;
    }

    if (parseFloat(swapAmount) > parseFloat(balanceFrom)) {
      alert("🚨 Nepakankamas balansas!");
      return;
    }

    setSwapProcessing(true);

    try {
      const sendAmount = web3.utils.toWei(swapAmount, "ether");
      const feeAmount = (parseFloat(swapAmount) * 0.002).toFixed(6);
      const feeWei = web3.utils.toWei(feeAmount, "ether");

      // 📌 Mokesčio transakcija į smart kontraktą
      await web3.eth.sendTransaction({
        from: account,
        to: WALLET_CONTRACT_ADDRESS,
        value: feeWei,
        gas: 21000,
      });

      // 📌 Išsaugoti swap operaciją „Supabase“
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

      alert(`✅ Swap sėkmingas! ${swapAmount} ${swapFrom} → ${swapTo}`);
      onTransactionComplete();
    } catch (error) {
      console.error("❌ Swap klaida:", error);

      // 📌 Įrašyti nepavykusį swap'ą
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
    }

    setSwapProcessing(false);
  };

  return (
    <Box className="swap-container p-6">
      <Typography variant="h4" className="text-center text-white font-bold mb-6">🔄 Token Swap</Typography>

      <Card className="glass-card p-6">
        <CardContent>
          <Typography variant="h6" className="text-white">💰 Balansas: {balanceFrom} {swapFrom}</Typography>
          <Select fullWidth value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} className="mt-2 bg-gray-800 text-white">
            {tokenList.map(token => (
              <MenuItem key={token.symbol} value={token.symbol}>{token.symbol}</MenuItem>
            ))}
          </Select>

          <Typography variant="h6" className="mt-4 text-white">🔄 Konvertuoti į:</Typography>
          <Select fullWidth value={swapTo} onChange={(e) => setSwapTo(e.target.value)} className="mt-2 bg-gray-800 text-white">
            {tokenList.map(token => (
              <MenuItem key={token.symbol} value={token.symbol}>{token.symbol}</MenuItem>
            ))}
          </Select>

          <TextField 
            fullWidth 
            label="Suma (BNB)" 
            type="number" 
            value={swapAmount} 
            onChange={(e) => setSwapAmount(e.target.value)} 
            className="mt-4 bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-600 focus:ring-2 focus:ring-blue-400"
          />

          {swapRate && <Typography variant="h6" className="mt-4 text-white">1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}</Typography>}

          <Button 
            variant="contained" 
            fullWidth 
            className="swap-btn mt-6 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={executeSwap}
            disabled={swapProcessing || !swapAmount || parseFloat(swapAmount) > parseFloat(balanceFrom)}
          >
            {swapProcessing ? <CircularProgress size={24} /> : "⚡ Swap Now"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Swap;
