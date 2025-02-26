import TransactionHistory from "../components/TransactionHistory";
import Link from "next/link";
import "../styles/globals.css";

export default function TransactionsPage() {
  return (
    <div className="transactions-page">
      <div className="header">
        <h1>📜 Transaction History</h1>
        <p>📊 Track all your BNB transactions in real-time with live conversion rates.</p>
      </div>

      {/* 🔹 TRANSACTION HISTORY COMPONENT */}
      <TransactionHistory />

      {/* 🔹 NAVIGATION BUTTONS */}
      <div className="navigation">
        <Link href="/dashboard">
          <button className="nav-btn">🏠 Go to Dashboard</button>
        </Link>
        <Link href="/send">
          <button className="nav-btn">🚀 Send Crypto</button>
        </Link>
        <Link href="/receive">
          <button className="nav-btn">📥 Receive Crypto</button>
        </Link>
        <Link href="/swap">
          <button className="nav-btn">🔄 Swap Crypto</button>
        </Link>
      </div>
    </div>
  );
}
