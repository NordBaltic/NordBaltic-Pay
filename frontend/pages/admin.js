import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Web3 from "web3";
import "../styles/globals.css";

// Dinamiškai importuojamas Admin komponentas
const AdminPanel = dynamic(() => import("../components/Admin"), { ssr: false });

const AdminPage = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
      setLoading(false);
    };

    loadAccount();
  }, []);

  if (loading) return <p className="loading">🔄 Loading...</p>;

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
        <button onClick={() => router.push("/")}>🏠 Back to Home</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>🔧 Admin Dashboard</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      <div className="admin-sections">
        <div className="admin-card" onClick={() => router.push("/admin/fees")}>
          <h2>💰 Fees Control</h2>
          <p>Manage Swap, Send, Donation, and Staking fees.</p>
        </div>

        <div className="admin-card" onClick={() => router.push("/admin/security")}>
          <h2>🛡️ Security & User Control</h2>
          <p>Ban, Unban users, Freeze/Unfreeze funds.</p>
        </div>

        <div className="admin-card" onClick={() => router.push("/admin/analytics")}>
          <h2>📊 Analytics</h2>
          <p>View platform statistics and usage metrics.</p>
        </div>
      </div>

      {/* Dinaminis Admin Panel komponentas */}
      <AdminPanel />
    </div>
  );
};

export default AdminPage;
