import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Security from "./Security"; // ✅ Integruojame saugumo valdymą
import "../styles/globals.css";

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fees, setFees] = useState({ swap: 0.2, send: 3, donation: 3 });
  const [statusMessage, setStatusMessage] = useState("");

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

          fetchSettings();
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/admin/settings"); // 🔹 Pakeisti su realiu API
      setFees(response.data.fees);
    } catch (error) {
      console.error("❌ Error fetching admin settings:", error);
    }
  };

  const updateFees = async (feeType, value) => {
    try {
      await axios.post("/api/admin/updateFees", { feeType, value }); // 🔹 API sujungimas
      setStatusMessage(`✅ Updated ${feeType} fee to ${value}%`);
      fetchSettings();
    } catch (error) {
      console.error("❌ Error updating fees:", error);
      setStatusMessage("❌ Update failed.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>🔧 Admin Panel</h1>
      <p className="admin-status">Welcome, <strong>{account}</strong></p>

      {/* 🔹 Mokesčių valdymas */}
      <div className="settings-section">
        <h2>⚙️ Fees Management</h2>
        <div className="fees-control">
          <label>Swap Fee (%)</label>
          <input
            type="number"
            value={fees.swap}
            onChange={(e) => updateFees("swap", e.target.value)}
          />

          <label>Send Fee (%)</label>
          <input
            type="number"
            value={fees.send}
            onChange={(e) => updateFees("send", e.target.value)}
          />

          <label>Donation Fee (%)</label>
          <input
            type="number"
            value={fees.donation}
            onChange={(e) => updateFees("donation", e.target.value)}
          />
        </div>
      </div>

      {/* 🔹 Vartotojų valdymas */}
      <Security />

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}
