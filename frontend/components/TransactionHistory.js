import { useState, useEffect } from "react";
import Web3 from "web3";

export default function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    try {
      const web3 = new Web3(process.env.NEXT_PUBLIC_BSC_SCAN_API);
      const response = await fetch(
        `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&sort=desc&apikey=${process.env.NEXT_PUBLIC_BSC_SCAN_API}`
      );
      const data = await response.json();

      if (data.status === "1") {
        setTransactions(data.result.slice(0, 10)); // Rodo paskutines 10 transakcijų
      }
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      <ul>
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <li key={index} className="transaction-item">
              <p><strong>Hash:</strong> <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">{tx.hash.slice(0, 10)}...</a></p>
              <p><strong>From:</strong> {tx.from.slice(0, 6)}...{tx.from.slice(-4)}</p>
              <p><strong>To:</strong> {tx.to.slice(0, 6)}...{tx.to.slice(-4)}</p>
              <p><strong>Value:</strong> {Web3.utils.fromWei(tx.value, "ether")} BNB</p>
              <p><strong>Date:</strong> {new Date(tx.timeStamp * 1000).toLocaleString()}</p>
            </li>
          ))
        ) : (
          <p>Loading transactions...</p>
        )}
      </ul>
    </div>
  );
}
