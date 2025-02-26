// 📂 /pages/transactions.js - MAX PREMIUM TRANSACTION PAGE
import Transactions from "../components/Transactions";
import "../styles/globals.css";

export default function TransactionsPage() {
  return (
    <div className="transactions-page">
      <h1>📜 Transaction History</h1>
      <p>🔍 View and track all your BSC transactions.</p>
      <Transactions />
    </div>
  );
}
