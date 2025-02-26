import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import { useTheme } from "./ThemeContext";
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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DarkModeIcon from "@mui/icons-material/NightsStay";
import LightModeIcon from "@mui/icons-material/WbSunny";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/globals.css";

export default function Navbar() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, account);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    const netName = netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network";
    setNetwork(netName);
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
        localStorage.setItem("walletAccount", accounts[0]);
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
      localStorage.setItem("walletAccount", accounts[0]);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("🔴 WalletConnect klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetwork("");
    setBalance("0.00");
    localStorage.removeItem("walletAccount");
  };

  return (
    <AppBar position="static" className="navbar glass-navbar">
      <Toolbar className="flex justify-between">
        {/* LOGOTIPAS */}
        <Link href="/">
          <Typography variant="h6" className="cursor-pointer text-white font-bold">
            🏦 NordBaltic Pay
          </Typography>
        </Link>

        {/* NAVIGACIJOS MYGTUKAI */}
        <Box className="hidden md:flex space-x-4">
          <Link href="/dashboard"><Button color="inherit">📊 Dashboard</Button></Link>
          <Link href="/staking"><Button color="inherit">💸 Staking</Button></Link>
          <Link href="/transactions"><Button color="inherit">📜 Transactions</Button></Link>
          <Link href="/swap"><Button color="inherit">🔄 Swap</Button></Link>
          <Link href="/donations"><Button color="inherit">❤️ Donations</Button></Link>
          <Link href="/admin"><Button color="inherit">🛠️ Admin</Button></Link>
        </Box>

        {/* WALLET PRISIJUNGIMAS */}
        {account ? (
          <Box className="flex items-center space-x-4">
            <Typography variant="body2" className="text-white">
              ✅ {account.substring(0, 6)}...{account.slice(-4)}
            </Typography>
            <Typography variant="body2" className="text-white">{network}</Typography>
            <Typography variant="body2" className="text-white">💰 {balance} BNB</Typography>
            {convertedBalance && (
              <Typography variant="body2" className="text-white">
                ≈ {currency === "USD" ? convertedBalance.usd : convertedBalance.eur} {currency}
              </Typography>
            )}
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1"
            >
              <MenuItem value="USD">💵 USD</MenuItem>
              <MenuItem value="EUR">💶 EUR</MenuItem>
            </Select>
            <IconButton color="inherit" onClick={disconnectWallet}><LogoutIcon /></IconButton>
          </Box>
        ) : (
          <Box className="flex space-x-2">
            <Button variant="contained" color="primary" onClick={connectWalletConnect}>🔗 WalletConnect</Button>
            <Button variant="contained" color="secondary" onClick={connectMetaMask}>🦊 MetaMask</Button>
          </Box>
        )}

        {/* TEMOS PERJUNGIMAS */}
        <IconButton color="inherit" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {/* MOBILI NAVIGACIJA */}
        <IconButton color="inherit" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <Link href="/dashboard"><MenuItem>📊 Dashboard</MenuItem></Link>
          <Link href="/staking"><MenuItem>💸 Staking</MenuItem></Link>
          <Link href="/transactions"><MenuItem>📜 Transactions</MenuItem></Link>
          <Link href="/swap"><MenuItem>🔄 Swap</MenuItem></Link>
          <Link href="/donations"><MenuItem>❤️ Donations</MenuItem></Link>
          <Link href="/admin"><MenuItem>🛠️ Admin</MenuItem></Link>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
