import { useState, useEffect } from "react";
import Web3 from "web3";
import dynamic from "next/dynamic";
import "../styles/globals.css";
import axios from "axios";

const Charts = dynamic(() => import("../components/Charts"), { ssr: false });

export default function AnalyticsPage() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          setIsAdmin(accounts[0].toLowerCase() === adminWallet);

          fetchAnalyticsData(selectedPeriod);
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
    const interval = setInterval(() => fetchAnalyticsData(selectedPeriod), 30000); // Auto-refresh kas 30s
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchAnalyticsData = async (period) => {
    try {
      const response = await axios.get(`/api/analytics?period=${period}`);
      const { transactions, users, volume } = response.data;

      setTransactionData(transactions);
      setTotalUsers(users);
      setTotalVolume(volume);
    } catch (error) {
      console.error("📉 Analytics data fetch error:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="analytics-page">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = transactionData.slice(indexOfFirstTx, indexOfLastTx);

  return (
    <div className="analytics-page">
      <h1>📊 Analytics Dashboard</h1>

      <div className="analytics-summary">
        <div className="stat-box">
          <h3>👥 Total Users</h3>
          <p>{totalUsers.toLocaleString()}</p>
        </div>
        <div className="stat-box">
          <h3>💰 Total Volume</h3>
          <p>{totalVolume.toFixed(2)} BNB</p>
        </div>
      </div>

      <div className="analytics-filters">
        <label>Select Period:</label>
        <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <Charts data={transactionData} />

      <div className="transaction-list">
        <h2>Recent Transactions</h2>
        <ul>
          {currentTransactions.map((tx, index) => (
            <li key={index} className="transaction-card">
              <div>
                <p><strong>Tx Hash:</strong> {tx.hash.substring(0, 10)}... <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">🔍 View</a></p>
                <p><strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}</p>
                <p><strong>To:</strong> {tx.to.substring(0, 6)}...{tx.to.slice(-4)}</p>
                <p><strong>Amount:</strong> {parseFloat(tx.value) / 10 ** 18} BNB</p>
                <p><strong>Date:</strong> {new Date(tx.timeStamp * 1000).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>⬅️ Prev</button>
          <span>Page {currentPage} of {Math.ceil(transactionData.length / transactionsPerPage)}</span>
          <button disabled={currentPage === Math.ceil(transactionData.length / transactionsPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>Next ➡️</button>
        </div>
      </div>
    </div>
  );
}
