import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Transactions() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUserAccount();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTransactions();
      subscribeToTransactions();
    }
  }, [account]);

  // 🔵 Fetch user account from Supabase
  const fetchUserAccount = async () => {
    const { data } = await supabase.from("users").select("wallet").single();
    if (data && data.wallet) {
      setAccount(data.wallet);
    }
  };

  // 📜 Fetch transactions from Supabase
  const fetchTransactions = async () => {
    if (!account) return;
    const { data, error } = await supabase.from("transactions").select("*").eq("from", account).order("timestamp", { ascending: false });
    if (error) {
      console.error("🔴 Klaida gaunant transakcijas:", error);
      return;
    }
    setTransactions(data || []);
  };

  // 🔄 Real-time transaction updates
  const subscribeToTransactions = () => {
    supabase
      .channel("transactions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, (payload) => {
        setTransactions((prev) => [payload.new, ...prev]);
        setNotifications((prev) => [`🔄 New transaction: ${payload.new.amount} BNB`, ...prev]);
      })
      .subscribe();
  };

  // 💵 Valiutos konvertavimas
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

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

  // 🚀 Send Transaction
  const handleSendTransaction = async () => {
    if (!amount || !recipient || !web3) return;

    try {
      setLoading(true);
      const sendAmount = web3.utils.toWei(amount, "ether");
      const feeAmount = (parseFloat(amount) * 0.005).toFixed(4); // 0.5% transaction fee
      const feeWei = web3.utils.toWei(feeAmount, "ether");

      const tx = await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: sendAmount - feeWei,
        gas: 21000,
      });

      console.log("✅ Transaction successful:", tx);

      // 📌 Save transaction to Supabase
      await supabase.from("transactions").insert([
        {
          from: account,
          to: recipient,
          amount: amount,
          currency: "BNB",
          converted_amount: convertedAmount,
          converted_currency: currency,
          status: "Success",
          hash: tx.transactionHash,
          timestamp: new Date().toISOString(),
        }
      ]);

      // 📌 Save transaction fee
      await supabase.from("fees").insert([
        {
          wallet: account,
          transaction_hash: tx.transactionHash,
          fee_amount: feeAmount,
          currency: "BNB",
          timestamp: new Date().toISOString(),
        }
      ]);

      fetchTransactions();
    } catch (error) {
      console.error("❌ Klaida siunčiant transakciją:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="transactions-container p-6">
      <Typography variant="h4" className="text-center mb-6">🔄 Transactions</Typography>

      {notifications.length > 0 && (
        <Snackbar open autoHideDuration={5000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="info">{notifications[0]}</Alert>
        </Snackbar>
      )}

      <Card className="glass-card mb-6">
        <CardContent>
          <Typography variant="h5">📤 Send Transaction</Typography>
          <TextField fullWidth label="Recipient Address" variant="outlined" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-4" />
          <TextField fullWidth label="Amount (BNB)" type="number" variant="outlined" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-4" />
          <Select fullWidth value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-4">
            <MenuItem value="USD">💵 USD</MenuItem>
            <MenuItem value="EUR">💶 EUR</MenuItem>
          </Select>
          {convertedAmount && <Typography variant="body2" className="mt-2">≈ {convertedAmount} {currency}</Typography>}
          <Button variant="contained" color="primary" fullWidth className="mt-4" onClick={handleSendTransaction} disabled={loading}>
            {loading ? "🔄 Sending..." : "🚀 Send"}
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h5" className="mb-4">📜 Transaction History</Typography>
      <TableContainer component={Paper} className="glass-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount (BNB)</TableCell>
              <TableCell>Converted</TableCell>
              <TableCell>Fee (BNB)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell>{tx.from.substring(0, 6)}...{tx.from.slice(-4)}</TableCell>
                <TableCell>{tx.to.substring(0, 6)}...{tx.to.slice(-4)}</TableCell>
                <TableCell>{tx.amount} BNB</TableCell>
                <TableCell>{tx.converted_amount} {tx.converted_currency}</TableCell>
                <TableCell>{(parseFloat(tx.amount) * 0.005).toFixed(4)} BNB</TableCell>
                <TableCell>{tx.status}</TableCell>
                <TableCell>{tx.hash !== "N/A" ? <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank">🔗 View</a> : "N/A"}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan="8">No transactions found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
