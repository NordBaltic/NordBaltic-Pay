// 📂 /frontend/components/Navbar.js - ULTIMATE PREMIUM NAVBAR
import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { createClient } from "@supabase/supabase-js";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  Select,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DarkModeIcon from "@mui/icons-material/NightsStay";
import LightModeIcon from "@mui/icons-material/WbSunny";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    fetchUserSession();
  }, []);

  useEffect(() => {
    if (account) {
      initializeWeb3();
    }
  }, [account]);

  const fetchUserSession = async () => {
    const { data } = await supabase.from("users").select("wallet").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
    }
  };

  const initializeWeb3 = async () => {
    const web3Instance = new Web3(window.ethereum);
    setWeb3(web3Instance);
    detectNetwork(web3Instance);
    fetchBalance(web3Instance, account);
  };

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    setNetwork(netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network");
  };

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
    } catch (error) {
      console.error("🔴 Klaida gaunant balansą:", error);
    }
  };

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`
      );
      const data = await response.json();
      setConvertedBalance({
        usd: (bnbAmount * data.binancecoin.usd).toFixed(2),
        eur: (bnbAmount * data.binancecoin.eur).toFixed(2),
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant valiutų kursus:", error);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        await supabase.from("users").upsert({ wallet: accounts[0] });
        detectNetwork(web3Instance);
        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("🔴 MetaMask klaida:", error);
      }
    } else {
      alert("🚨 MetaMask nerastas!");
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
      await supabase.from("users").upsert({ wallet: accounts[0] });
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("🔴 WalletConnect klaida:", error);
    }
  };

  const disconnectWallet = async () => {
    setAccount(null);
    setWeb3(null);
    setNetwork("");
    setBalance("0.00");
    await supabase.from("users").update({ wallet: null });
  };

  return (
    <AppBar position="fixed" className="navbar glass-navbar neon-border">
      <Toolbar className="flex justify-between">
        {/* Mobile Menu Button */}
        <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)} className="glow-hover">
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Link href="/">
          <Typography variant="h6" className="cursor-pointer gradient-text font-bold tracking-widest">
            🏦 NordBaltic Pay
          </Typography>
        </Link>

        {/* Navigation Links */}
        <Box className="hidden md:flex space-x-6 animated-links">
          <Link href="/dashboard"><Button className="nav-btn glow-hover">📊 Dashboard</Button></Link>
          <Link href="/staking"><Button className="nav-btn glow-hover">💸 Staking</Button></Link>
          <Link href="/transactions"><Button className="nav-btn glow-hover">📜 Transactions</Button></Link>
          <Link href="/swap"><Button className="nav-btn glow-hover">🔄 Swap</Button></Link>
          <Link href="/donations"><Button className="nav-btn glow-hover">❤️ Donations</Button></Link>
          <Link href="/admin"><Button className="nav-btn glow-hover">🛠️ Admin</Button></Link>
        </Box>

        {/* Wallet & Theme Switch */}
        {account ? (
          <Box className="flex items-center space-x-4 animated-links">
            <Tooltip title="Wallet Address">
              <Typography variant="body2" className="wallet-text neon-glow">
                ✅ {account.substring(0, 6)}...{account.slice(-4)}
              </Typography>
            </Tooltip>
            <Tooltip title="Network"><Typography variant="body2">{network}</Typography></Tooltip>
            <Tooltip title="Balance"><Typography variant="body2">💰 {balance} BNB</Typography></Tooltip>
            {convertedBalance && (
              <Typography variant="body2">
                ≈ {currency === "USD" ? convertedBalance.usd : convertedBalance.eur} {currency}
              </Typography>
            )}
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-gray-900 text-white">
              <MenuItem value="USD">💵 USD</MenuItem>
              <MenuItem value="EUR">💶 EUR</MenuItem>
            </Select>
            <IconButton className="logout-btn glow-hover" onClick={disconnectWallet}><LogoutIcon /></IconButton>
          </Box>
        ) : (
          <Box className="flex space-x-3 animated-links">
            <Button className="connect-btn glow-hover" onClick={connectWalletConnect}>🔗 WalletConnect</Button>
            <Button className="connect-btn glow-hover" onClick={connectMetaMask}>🦊 MetaMask</Button>
          </Box>
        )}

        {/* Theme Switch */}
        <IconButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="glow-hover">
          {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
