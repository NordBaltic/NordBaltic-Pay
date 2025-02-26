import { useState, useEffect } from "react";
import Web3 from "web3";
import QRCode from "qrcode.react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem, CircularProgress, Snackbar, Alert } from "@mui/material";
import Loader from "./Loader"; // 🔥 Krovimosi efektas
import "../styles/globals.css";

// 🔥 SMART CONTRACT ADRESAS IŠ `.env`
const smartContractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;

export default function Send() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("walletAccount", accounts[0]);
          fetchBalance(web3Instance, accounts[0]);
        }
      }
    };
    loadWeb3();
  }, []);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("❌ Klaida gaunant balansą:", error);
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

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

  useEffect(() => {
    if (!recipient) return;
    setIsValidAddress(Web3.utils.isAddress(recipient));
  }, [recipient]);

  const handleSend = async () => {
    if (!recipient || !amount) {
      setStatus("❌ Please enter recipient and amount.");
      return;
    }
    if (!isValidAddress) {
      setStatus("❌ Invalid recipient address.");
      return;
    }
    if (!smartContractAddress) {
      setStatus("⚠️ Smart contract address not set in .env!");
      return;
    }

    try {
      setStatus("⏳ Processing transaction...");
      setIsLoading(true);
      const sendAmount = web3.utils.toWei(amount, "ether");

      // 🔹 Transakcija siunčiama į smart contract 🔹
      const transaction = await web3.eth.sendTransaction({
        from: account,
        to: smartContractAddress,
        value: sendAmount,
        gas: 21000,
      });

      setStatus(`✅ Transaction Successful! TX Hash: ${transaction.transactionHash}`);
      setNotification("🚀 Transaction completed successfully!");
      fetchBalance(web3, account);
    } catch (error) {
      console.error("❌ Transaction Failed", error);
      setStatus("❌ Transaction failed. Please try again.");
      setNotification("⚠️ Transaction failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="send-container p-6">
      {notification && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity={status.includes("Success") ? "success" : "error"}>{notification}</Alert>
        </Snackbar>
      )}

      <Typography variant="h4" className="text-center mb-6">📤 Send BNB</Typography>

      {isLoading ? (
        <Loader message="Processing transaction..." />
      ) : !account ? (
        <Box className="wallet-buttons">
          <Button variant="contained" fullWidth onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            🦊 Connect MetaMask
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h6" className="text-center">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</Typography>
          <Typography variant="h5" className="text-center mt-4">💰 Balance: {bnbBalance} BNB</Typography>

          <Card className="glass-card mt-6">
            <CardContent>
              <TextField fullWidth label="Recipient Address" variant="outlined" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-4" />
              {recipient && <QRCode value={recipient} size={128} className="qr-code mt-4" />}
              {!isValidAddress && <Typography color="error" className="mt-2">❌ Invalid Address</Typography>}

              <TextField fullWidth label="Amount (BNB)" type="number" variant="outlined" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-4" />
              
              <Select fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-4">
                <MenuItem value="EUR">💶 EUR</MenuItem>
                <MenuItem value="USD">💵 USD</MenuItem>
              </Select>
              
              {convertedAmount && <Typography variant="body2" className="mt-2">≈ {convertedAmount} {currency}</Typography>}

              <Button variant="contained" color="primary" fullWidth className="mt-4" onClick={handleSend} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "🚀 Send"}
              </Button>
            </CardContent>
          </Card>

          <Typography variant="h6" className="text-center mt-4">{status}</Typography>
        </>
      )}
    </Box>
  );
}
