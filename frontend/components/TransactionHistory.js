import { useState, useEffect } from "react";
import Web3 from "web3";

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!account) return;

    const fetchTransactions = async () => {
      try {
        const web3 = new Web3("https://bsc-dataseed.binance.org/");
        const latestBlock = await web3.eth.getBlockNumber();
        const txs = [];

        for (let i = latestBlock; i >= latestBlock - 100; i--) {
          const block = await web3.eth.getBlock(i, true);
          block.transactions.forEach((tx) => {
            if (tx.from.toLowerCase() === account.toLowerCase() || tx.to?.toLowerCase() === account.toLowerCase()) {
              txs.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: web3.utils.fromWei(tx.value, "ether"),
                timestamp: new Date(),
              });
            }
          });

          if (txs.length >= 10) break; 
        }

        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [account]);

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No recent transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx, index) => (
            <li key={index}>
              <p><strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}</p>
              <p><strong>To:</strong> {tx.to ? `${tx.to.substring(0, 6)}...${tx.to.slice(-4)}` : "Contract Interaction"}</p>
              <p><strong>Amount:</strong> {tx.value} BNB</p>
              <p><strong>Transaction Hash:</strong> <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">{tx.hash.substring(0, 10)}...</a></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;
