import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
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

  useEffect(() => {
    fetchUserAccount();
  }, []);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTransactions();
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
      
      // 📌 Save failed transaction
      await supabase.from("transactions").insert([
        {
          from: account,
          to: recipient,
          amount: amount,
          currency: "BNB",
          converted_amount: convertedAmount,
          converted_currency: currency,
          status: "Failed",
          hash: "N/A",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transactions-container">
      <h2>🔄 Transactions</h2>

      <div className="send-transaction">
        <label>Recipient Address</label>
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Enter recipient address" />

        <label>Amount (BNB)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />

        <label>Show in:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">💵 USD</option>
          <option value="EUR">💶 EUR</option>
        </select>

        {convertedAmount && <p className="converted-amount">≈ {convertedAmount} {currency}</p>}

        <button className="send-btn" onClick={handleSendTransaction} disabled={loading}>
          {loading ? "🔄 Sending..." : "🚀 Send"}
        </button>
      </div>

      <h3>📜 Transaction History</h3>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>From</th>
            <th>To</th>
            <th>Amount (BNB)</th>
            <th>Converted</th>
            <th>Fee (BNB)</th>
            <th>Status</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((tx, index) => (
              <tr key={index}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td>{tx.from.substring(0, 6)}...{tx.from.slice(-4)}</td>
                <td>{tx.to.substring(0, 6)}...{tx.to.slice(-4)}</td>
                <td>{tx.amount} BNB</td>
                <td>{tx.converted_amount} {tx.converted_currency}</td>
                <td>{(parseFloat(tx.amount) * 0.005).toFixed(4)} BNB</td>
                <td className={tx.status === "Success" ? "success" : "failed"}>{tx.status}</td>
                <td>
                  {tx.hash !== "N/A" ? (
                    <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                      🔗 View
                    </a>
                  ) : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
