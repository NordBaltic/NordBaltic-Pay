import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, Typography, Button, Grid, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [tokenPrices, setTokenPrices] = useState({});
  const [currency, setCurrency] = useState("usd");
  const [isLoading, setIsLoading] = useState(true);
  const [network, setNetwork] = useState("");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
      fetchTokens();
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    setNetwork(netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network");
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
        fetchTokens();
      } catch (error) {
        console.error("❌ MetaMask connection error:", error);
      }
    } else {
      alert("🚨 MetaMask not found!");
    }
  };

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
      detectNetwork(web3Instance);
      fetchTokens();
    } catch (error) {
      console.error("❌ WalletConnect connection error:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("walletAccount");
  };

  // 📜 Gauti vartotojo tokenus
  const fetchTokens = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&address=${account}&apikey=${apiKey}`;
      const response = await axios.get(url);

      if (response.data.status === "1") {
        setTokens(response.data.result);
        fetchTokenPrices(response.data.result);
      } else {
        console.error("❌ BSCScan API klaida:", response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Klaida gaunant tokenus:", error);
      setIsLoading(false);
    }
  };

  // 🔹 Gauti tokenų kainas ir rinkos kapitalizaciją
  const fetchTokenPrices = async (tokenList) => {
    try {
      const tokenSymbols = tokenList.map((token) => token.tokenSymbol.toLowerCase()).join(",");
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbols}&vs_currencies=usd,eur&include_market_cap=true&include_24hr_change=true`
      );
      setTokenPrices(response.data);
    } catch (error) {
      console.error("❌ Error fetching token prices:", error);
    }
  };

  // 🔹 Formatuoti tokenų sąrašą
  const formattedTokens = useMemo(() => {
    return tokens.map((token) => {
      const balance = parseFloat(token.balance) / 10 ** token.tokenDecimal;
      const price = tokenPrices[token.tokenSymbol.toLowerCase()]?.[currency] || 0;
      const totalValue = (balance * price).toFixed(2);
      const marketCap = tokenPrices[token.tokenSymbol.toLowerCase()]?.market_cap || "N/A";
      const priceChange = tokenPrices[token.tokenSymbol.toLowerCase()]?.price_change_percentage_24h || 0;

      return {
        ...token,
        balance,
        price,
        totalValue,
        marketCap,
        priceChange,
      };
    });
  }, [tokens, tokenPrices, currency]);

  return (
    <Card className="glass-card max-w-4xl mx-auto p-6 text-center">
      <CardContent>
        <Typography variant="h5" className="mb-4">💰 My Tokens</Typography>
        <Typography variant="body1" className="mb-4">🌐 {network}</Typography>

        <Button variant="contained" color="secondary" onClick={() => setCurrency(currency === "usd" ? "eur" : "usd")}>
          Show in {currency === "usd" ? "EUR" : "USD"}
        </Button>

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
          <div>
            <Typography variant="body1" className="mb-2">
              ✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}
            </Typography>
            <Button variant="outlined" color="error" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        )}

        {isLoading ? (
          <CircularProgress className="mt-4" />
        ) : tokens.length > 0 ? (
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Price ({currency.toUpperCase()})</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>Market Cap</TableCell>
                <TableCell>24h Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formattedTokens.map((token) => (
                <TableRow key={token.contractAddress}>
                  <TableCell>{token.tokenName}</TableCell>
                  <TableCell>{token.tokenSymbol}</TableCell>
                  <TableCell>{token.balance.toFixed(4)}</TableCell>
                  <TableCell>{currency.toUpperCase()} {token.price.toFixed(2)}</TableCell>
                  <TableCell>{currency.toUpperCase()} {token.totalValue}</TableCell>
                  <TableCell>${token.marketCap.toLocaleString()}</TableCell>
                  <TableCell style={{ color: token.priceChange > 0 ? "green" : "red" }}>
                    {token.priceChange.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">🚫 No tokens found.</Typography>
        )}
      </CardContent>
    </Card>
  );
        }
