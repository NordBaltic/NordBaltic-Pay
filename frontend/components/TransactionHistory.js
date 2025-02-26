// 📂 /frontend/components/TransactionHistory.js
// ✅ TRANSAKCIJŲ ISTORIJA – rodo paskutines transakcijas
// ✅ Pilna Web3 integracija

import { useState, useEffect } from "react";
import Web3 from "web3";

export default function TransactionHistory({ account }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account) return;

      const web3 = new Web3("https://bsc-dataseed.binance.org/");
      const latestBlock = await web3.eth.getBlockNumber();
      const blocksToCheck = 100; // Tikrinam paskutinius 100 blokų

      let userTransactions = [];
      for (let i = 0; i < blocksToCheck; i++) {
        const block = await web3.eth.getBlock(latestBlock - i, true);
        if (block && block.transactions) {
          const userTxs = block.transactions.filter((tx) => tx.from.toLowerCase() === account.toLowerCase() || tx.to?.toLowerCase() === account.toLowerCase());
          userTransactions = [...userTransactions, ...userTxs];
        }
      }

      setTransactions(userTransactions);
    };

    fetchTransactions();
  }, [account]);

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((tx, index) => (
            <li key={index}>
              <p><strong>Tx Hash:</strong> {tx.hash.substring(0, 10)}...{tx.hash.slice(-6)}</p>
              <p><strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}</p>
              <p><strong>To:</strong> {tx.to ? tx.to.substring(0, 6) + "..." + tx.to.slice(-4) : "Contract"}</p>
              <p><strong>Value:</strong> {Web3.utils.fromWei(tx.value, "ether")} BNB</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
