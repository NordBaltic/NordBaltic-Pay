import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Box, Card, CardContent, Typography, Button, Select, MenuItem, CircularProgress, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Receive() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [convertedAmount, setConvertedAmount] = useState({ usd: "0.00", eur: "0.00" });
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(false);
  const [transactionAlert, setTransactionAlert] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchUserAccount();
    listenForTransactions();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
    }
  }, [account]);

  // 🔵 Fetch user account from Supabase
  const fetchUserAccount = async () => {
    const { data, error } = await supabase.from("users").select("wallet").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
      fetchBalance(web3, data.wallet);
    } else if (error) {
      console.error("❌ Klaida gaunant vartotojo duomenis iš Supabase:", error);
    }
  };

  // 💰 Fetch Balance and Conversion Rate
  const fetchBalance = async (web3Instance, account) => {
    try {
      setLoading(true);
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));

      await fetchConversionRate(balanceEth);
      await supabase.from("users").update({ balance: balanceEth }).eq("wallet", account);

      setLoading(false);
    } catch (error) {
      console.error("❌ Klaida gaunant balansą:", error);
      setLoading(false);
    }
  };

  // 💱 Fetch BNB to Fiat Rates
  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      const rates = response.data.binancecoin;
      setConvertedAmount({
        usd: (bnbAmount * rates.usd).toFixed(2),
        eur: (bnbAmount * rates.eur).toFixed(2),
      });
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
    }
  };

  // 🔄 Realaus Laiko Transakcijų Stebėjimas
  const listenForTransactions = async () => {
    const { data } = supabase
      .channel("transactions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload) => {
        if (payload.new.to === account) {
          setTransactionAlert(true);
          setLastTransaction(payload.new);
        }
      })
      .subscribe();
  };

  // 🦊 Connect MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        await supabase.from("users").upsert({ wallet: accounts[0] });

        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("❌ MetaMask klaida:", error);
      }
    } else {
      alert("⚠️ MetaMask nerastas!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="receive-container glass-card p-6"
    >
      <Typography variant="h4" className="text-center mb-6 neon-text">📥 Receive Crypto</Typography>

      {!account ? (
        <Box className="wallet-buttons">
          <Button variant="contained" fullWidth onClick={connectMetaMask} className="mt-2">
            🦊 Connect MetaMask
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h6" className="text-center">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</Typography>
          {loading ? <CircularProgress className="mt-4" /> : <Typography variant="h5" className="text-center mt-4">💰 Balance: {bnbBalance} BNB</Typography>}

          <Card className="glass-card mt-6">
            <CardContent className="text-center">
              <Typography variant="h6">🔹 Your Wallet Address</Typography>
              <QRCode value={account} size={180} className="qr-code mt-4" />
              <Typography variant="body2" className="mt-2">📸 Scan the QR code to receive crypto.</Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" className="text-center mt-4">Show in:</Typography>
          <Select fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-2">
            <MenuItem value="EUR">💶 EUR</MenuItem>
            <MenuItem value="USD">💵 USD</MenuItem>
          </Select>

          {convertedAmount && (
            <Typography variant="h6" className="text-center mt-4">
              1 BNB ≈ {currency === "EUR" ? convertedAmount.eur : convertedAmount.usd} {currency}
            </Typography>
          )}

          {transactionAlert && (
            <Snackbar open autoHideDuration={5000} onClose={() => setTransactionAlert(false)}>
              <Alert severity="success">✅ Received {lastTransaction?.amount} BNB!</Alert>
            </Snackbar>
          )}
        </>
      )}
    </motion.div>
  );
}
