import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, Typography, Button, Grid, CircularProgress, Alert } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [bnbPrice, setBnbPrice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      fetchTransactions();
      fetchBNBPrice();
      const interval = setInterval(() => {
        fetchTransactions();
        fetchBNBPrice();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [account]);

  // 🔹 Gauti BNB kainą USD
  const fetchBNBPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur"
      );
      setBnbPrice(response.data.binancecoin);
    } catch (error) {
      console.error("❌ Error fetching BNB price:", error);
    }
  };

  // 📜 Gauti tranzakcijas iš BSCScan ir Supabase
  const fetchTransactions = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
      const response = await axios.get(url);

      if (response.data.status === "1") {
        const transactionsData = response.data.result.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: (parseFloat(tx.value) / 10 ** 18).toFixed(4),
          timestamp: new Date(tx.timeStamp * 1000).toISOString(),
          status: tx.isError === "0" ? "✅ Completed" : "❌ Failed",
        }));

        setTransactions(transactionsData);
        await supabase.from("transactions").upsert(transactionsData);
      } else {
        console.error("❌ BSCScan API error:", response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setIsLoading(false);
    }
  };

  // 🦊 MetaMask prisijungimas
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
      } catch (error) {
        console.error("❌ MetaMask connection error:", error);
        setError("🚨 MetaMask prisijungimo klaida!");
      }
    } else {
      alert("🚨 MetaMask not found!");
    }
  };

  // 🔗 WalletConnect prisijungimas
  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: process.env.NEXT_PUBLIC_BSC_RPC },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      localStorage.setItem("walletAccount", accounts[0]);
    } catch (error) {
      console.error("❌ WalletConnect connection error:", error);
      setError("❌ WalletConnect prisijungimo klaida!");
    }
  };

  return (
    <Card className="glass-card max-w-3xl mx-auto p-6 text-center">
      <CardContent>
        <Typography variant="h5" className="mb-4">📜 Transaction History</Typography>

        {!account ? (
          <div className="wallet-buttons">
            <Button variant="contained" color="primary" onClick={connectMetaMask}>
              🦊 Connect MetaMask
            </Button>
            <Button variant="contained" color="secondary" onClick={connectWalletConnect}>
              🔗 Connect WalletConnect
            </Button>
          </div>
        ) : (
          <Typography variant="body1" className="mb-4">
            ✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}
          </Typography>
        )}

        {isLoading ? (
          <CircularProgress />
        ) : transactions.length > 0 ? (
          <Grid container spacing={2} className="transaction-list">
            {transactions.map((tx) => {
              const txUSD = bnbPrice ? (tx.value * bnbPrice.usd).toFixed(2) : "Loading...";
              return (
                <Grid item xs={12} key={tx.hash}>
                  <Card className="transaction-card p-4">
                    <CardContent>
                      <Typography variant="body1">
                        <strong>Tx Hash:</strong>{" "}
                        <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                          {tx.hash.substring(0, 10)}... 🔍
                        </a>
                      </Typography>
                      <Typography variant="body2">🔄 {tx.status}</Typography>
                      <Typography variant="body2">
                        <strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>To:</strong> {tx.to.substring(0, 6)}...{tx.to.slice(-4)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Value:</strong> {tx.value} BNB (~${txUSD} USD)
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {new Date(tx.timestamp).toLocaleString()}
                      </Typography>
                      <div className="qr-code mt-2">
                        <QRCode value={`https://bscscan.com/tx/${tx.hash}`} size={60} />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">🚫 No transactions found.</Alert>
        )}
      </CardContent>
    </Card>
  );
}
