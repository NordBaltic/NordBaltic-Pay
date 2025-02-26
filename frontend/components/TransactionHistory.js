import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

export default function TransactionHistory({ provider, walletAddress }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (provider && walletAddress) {
      fetchTransactions();
    }
  }, [provider, walletAddress]);

  const fetchTransactions = async () => {
    try {
      const history = await provider.getHistory(walletAddress);
      const formattedTransactions = history.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.utils.formatEther(tx.value),
        timestamp: new Date(tx.timestamp * 1000).toLocaleString(),
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Klaida gaunant transakcijų istoriją:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary p-6 rounded-lg shadow-dark"
    >
      <h2 className="text-secondary text-xl font-bold mb-4">Transaction History</h2>
      <ul className="overflow-y-auto max-h-96">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <li
              key={index}
              className="flex flex-col py-3 border-b border-secondary text-white"
            >
              <span><strong>From:</strong> {tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>
              <span><strong>To:</strong> {tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
              <span><strong>Value:</strong> {tx.value} BNB</span>
              <span><strong>Time:</strong> {tx.timestamp}</span>
              <span><strong>Hash:</strong> <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-secondary">View on BscScan</a></span>
            </li>
          ))
        ) : (
          <li className="text-white">No transactions found.</li>
        )}
      </ul>
    </motion.div>
  );
}
