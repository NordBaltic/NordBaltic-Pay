import { useState, useEffect } from "react";
import Web3 from "web3";

const TRANSACTION_API = "https://api.bscscan.com/api?module=account&action=txlist&address="; 
const API_KEY = "YOUR_BSCSCAN_API_KEY"; // Naudok savo API key

export default function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${TRANSACTION_API}${account}&apikey=${API_KEY}`);
      const data = await response.json();

      if (data.result) {
        const formattedTransactions = data.result.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: Web3.utils.fromWei(tx.value, "ether"),
          timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
          status: tx.isError === "0" ? "Success" : "Failed",
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      <ul>
        {transactions.length === 0 ? (
          <p>No recent transactions found.</p>
        ) : (
          transactions.map((tx, index) => (
            <li key={index} className="transaction-item">
              <p><strong>From:</strong> {tx.from}</p>
              <p><strong>To:</strong> {tx.to}</p>
              <p><strong>Value:</strong> {tx.value} BNB</p>
              <p><strong>Status:</strong> {tx.status}</p>
              <p><strong>Time:</strong> {tx.timestamp}</p>
              <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                View on BscScan
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
