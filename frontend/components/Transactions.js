// 📂 /components/Transactions.js - MAX PREMIUM TRANSACTIONS LIST
import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import QRCode from "qrcode.react";
import "../styles/globals.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("24h");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTransactions();
    }
  }, [account, filter]);

  const fetchTransactions = async () => {
    if (!account) return;

    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
      const response = await axios.get(url);
      if (response.data.status === "1") {
        const filteredTransactions = filterTransactions(response.data.result, filter);
        setTransactions(filteredTransactions);
      } else {
        console.error("❌ BSCScan API klaida:", response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Klaida gaunant tranzakcijas:", error);
    }
  };

  const filterTransactions = (txs, period) => {
    const now = new Date();
    const filteredTxs = txs.filter((tx) => {
      const txTime = new Date(tx.timeStamp * 1000);
      if (period === "24h") return now - txTime < 24 * 60 * 60 * 1000;
      if (period === "week") return now - txTime < 7 * 24 * 60 * 60 * 1000;
      if (period === "month") return now - txTime < 30 * 24 * 60 * 60 * 1000;
      return true;
    });
    return filteredTxs;
  };

  return (
    <div className="transactions-container">
      <h2>📜 Transaction History</h2>

      <div className="filter-buttons">
        <button onClick={() => setFilter("24h")}>24h</button>
        <button onClick={() => setFilter("week")}>1 Week</button>
        <button onClick={() => setFilter("month")}>1 Month</button>
      </div>

      {isLoading ? (
        <p>⏳ Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Tx Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value (BNB)</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.hash}>
                <td>
                  <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                    {tx.hash.substring(0, 10)}...
                  </a>
                </td>
                <td>{tx.from.substring(0, 6)}...{tx.from.slice(-4)}</td>
                <td>{tx.to.substring(0, 6)}...{tx.to.slice(-4)}</td>
                <td>{parseFloat(tx.value) / 10 ** 18}</td>
                <td>{tx.isError === "0" ? "✅ Success" : "❌ Failed"}</td>
                <td>{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
