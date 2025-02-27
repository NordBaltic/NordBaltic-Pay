import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";
import { createClient } from "@supabase/supabase-js";
import { Button, Card, CardContent, Typography, Grid, IconButton, Alert, CircularProgress } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrustWalletIcon from "@mui/icons-material/VerifiedUser";
import { useTheme } from "../context/ThemeContext";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function WalletConnectButton({ onConnect }) {
  const { theme } = useTheme();
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [walletType, setWalletType] = useState(localStorage.getItem("walletType") || null);
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
      saveUserToDB(account);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    const netName = netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network";
    setNetwork(netName);
  };

  // 🔹 Save User Wallet to Supabase
  const saveUserToDB = async (wallet) => {
    if (!wallet) return;
    await supabase.from("users").upsert({ wallet: wallet }, { onConflict: ["wallet"] });
  };

  const connectWallet = async (provider, walletName) => {
    try {
      setLoading(true);
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      setWalletType(walletName);
      localStorage.setItem("walletAccount", accounts[0]);
      localStorage.setItem("walletType", walletName);
      detectNetwork(web3Instance);
      saveUserToDB(accounts[0]);
      onConnect(accounts[0], web3Instance);
    } catch (err) {
      setError(`❌ ${walletName} prisijungimo klaida: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      await connectWallet(window.ethereum, "MetaMask");
    } else {
      setError("🚨 MetaMask nerastas!");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: process.env.NEXT_PUBLIC_BSC_RPC },
      });
      await provider.enable();
      await connectWallet(provider, "WalletConnect");
    } catch (err) {
      setError("❌ WalletConnect klaida: " + err.message);
    }
  };

  const connectCoinbaseWallet = async () => {
    try {
      const coinbaseWallet = new CoinbaseWalletSDK({ appName: "NordBaltic Pay" });
      const provider = coinbaseWallet.makeWeb3Provider(process.env.NEXT_PUBLIC_BSC_RPC, 56);
      await connectWallet(provider, "Coinbase Wallet");
    } catch (err) {
      setError("❌ Coinbase Wallet klaida: " + err.message);
    }
  };

  const connectTrustWallet = async () => {
    if (window.ethereum && window.ethereum.isTrust) {
      await connectWallet(window.ethereum, "Trust Wallet");
    } else {
      setError("🚨 Trust Wallet nėra įdiegta!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setWalletType(null);
    setNetwork("");
    localStorage.removeItem("walletAccount");
    localStorage.removeItem("walletType");
  };

  return (
    <Card className={`glass-card w-full max-w-lg mx-auto p-6 text-center ${theme}`}>
      <CardContent>
        <Typography variant="h5" className="mb-4">🔗 Wallet Connection</Typography>

        {error && <Alert severity="error" className="mb-4">{error}</Alert>}

        {account ? (
          <>
            <Typography variant="h6">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</Typography>
            <Typography variant="body2" color="textSecondary">{network}</Typography>
            <Typography variant="body2" color="textSecondary">Wallet: {walletType}</Typography>

            {walletType === "WalletConnect" && <QRCode value={account} size={120} className="mx-auto mt-4" />}

            <IconButton color="error" onClick={disconnectWallet} className="mt-4">
              <LogoutIcon fontSize="large" />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="h6" className="mb-4">Pasirinkite prisijungimo būdą:</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={connectMetaMask}
                  disabled={loading}
                  startIcon={loading && walletType === "MetaMask" ? <CircularProgress size={24} /> : <AccountBalanceWalletIcon />}
                >
                  🦊 MetaMask
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={connectWalletConnect}
                  disabled={loading}
                  startIcon={loading && walletType === "WalletConnect" ? <CircularProgress size={24} /> : "🔗"}
                >
                  WalletConnect
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={connectCoinbaseWallet}
                  disabled={loading}
                  startIcon={loading && walletType === "Coinbase Wallet" ? <CircularProgress size={24} /> : "🏦"}
                >
                  Coinbase
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  onClick={connectTrustWallet}
                  disabled={loading}
                  startIcon={loading && walletType === "Trust Wallet" ? <CircularProgress size={24} /> : <TrustWalletIcon />}
                >
                  Trust Wallet
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
}
