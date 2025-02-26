import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import "../styles/globals.css";

const Transactions = () => {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currency, setCurrency] = useState("USD");
  const [conversionRates, setConversionRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      fetchTransactions();
      fetchConversionRates();
    }
  }, [account, currency]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.NEXT_PUBLIC_BSCSCAN_API_KEY}`
      );

      const txs = response.data.result.map(tx => ({
        hash: tx.hash,
        type: determineTxType(tx),
        value: Web3.utils.fromWei(tx.value, "ether"),
        timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
        to: tx.to,
        from: tx.from,
      }));

      setTransactions(txs);
      setFilteredTransactions(txs);
      setLoading(false);
    } catch (error) {
      console.error("🔴 Error fetching transactions:", error);
    }
  };

  const fetchConversionRates = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      setConversionRates(response.data.binancecoin);
    } catch (error) {
      console.error("🔴 Error fetching conversion rates:", error);
    }
  };

  const determineTxType = (tx) => {
    if (tx.to.toLowerCase() === account.toLowerCase()) return "receive";
    if (tx.from.toLowerCase() === account.toLowerCase()) return "send";
    return "other";
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(tx => tx.type === filter));
    }
  };

  if (loading) return <p className="loading">🔄 Loading transactions...</p>;

  return (
    <div className="transactions-container">
      <h1>📜 Transaction History</h1>
      <p>Connected Wallet: {account.substring(0, 6)}...{account.slice(-4)}</p>

      <div className="transaction-controls">
        <label>Filter:</label>
        <select onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="all">📂 All Transactions</option>
          <option value="send">📤 Sent</option>
          <option value="receive">📥 Received</option>
        </select>

        <label>Show in:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">💵 USD</option>
          <option value="EUR">💶 EUR</option>
        </select>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Hash</th>
            <th>Type</th>
            <th>Amount (BNB)</th>
            <th>Converted</th>
            <th>From</th>
            <th>To</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((tx, index) => (
            <tr key={index}>
              <td><a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">{tx.hash.substring(0, 10)}...</a></td>
              <td>{tx.type === "receive" ? "📥 Received" : "📤 Sent"}</td>
              <td>{tx.value} BNB</td>
              <td>
                {conversionRates[currency.toLowerCase()]
                  ? `≈ ${(tx.value * conversionRates[currency.toLowerCase()]).toFixed(2)} ${currency}`
                  : "Loading..."}
              </td>
              <td>{tx.from.substring(0, 6)}...{tx.from.slice(-4)}</td>
              <td>{tx.to.substring(0, 6)}...{tx.to.slice(-4)}</td>
              <td>{tx.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
