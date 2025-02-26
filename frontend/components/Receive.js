import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Box, Card, CardContent, Typography, Button, Select, MenuItem, CircularProgress } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 🔹 SMART CONTRACT ADRESAS IŠ `.env`
const smartContractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;

export default function Receive() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [convertedAmount, setConvertedAmount] = useState({ usd: "0.00", eur: "0.00" });
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAccount();
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
    const { data, error } = await supabase.from("users").select("wallet, balance").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
      setBnbBalance(data.balance || "0.00");
    } else if (error) {
      console.error("❌ Klaida gaunant vartotojo duomenis iš Supabase:", error);
    }
  };

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);

      // 📌 Atnaujinti balansą Supabase
      await supabase.from("users").update({ balance: balanceEth }).eq("wallet", account);
    } catch (error) {
      console.error("❌ Klaida gaunant balansą:", error);
    }
  };

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

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        // 📌 Išsaugoti vartotojo piniginę Supabase, jei jos dar nėra
        await supabase.from("users").upsert({ wallet: accounts[0] });

        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("❌ MetaMask klaida:", error);
      }
    } else {
      alert("⚠️ MetaMask nerastas!");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
      });
      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      // 📌 Išsaugoti vartotojo piniginę Supabase, jei jos dar nėra
      await supabase.from("users").upsert({ wallet: accounts[0] });

      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("❌ WalletConnect klaida:", error);
    }
  };

  return (
    <Box className="receive-container p-6">
      <Typography variant="h4" className="text-center mb-6">📥 Receive Crypto</Typography>

      {!account ? (
        <Box className="wallet-buttons">
          <Button variant="contained" fullWidth onClick={connectWalletConnect} className="mt-2">
            🔗 Connect WalletConnect
          </Button>
          <Button variant="contained" fullWidth onClick={connectMetaMask} className="mt-2">
            🦊 Connect MetaMask
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h6" className="text-center">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</Typography>
          <Typography variant="h5" className="text-center mt-4">💰 Balance: {bnbBalance} BNB</Typography>

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
        </>
      )}
    </Box>
  );
}
