import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import "../styles/globals.css";

export default function Admin() {
  const [adminAccount, setAdminAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [stakeFeeDeposit, setStakeFeeDeposit] = useState("4");
  const [stakeFeeWithdraw, setStakeFeeWithdraw] = useState("4");
  const [sendFee, setSendFee] = useState("3");
  const [swapFee, setSwapFee] = useState("0.2");
  const [donateFee, setDonateFee] = useState("3");
  const [stakingContract, setStakingContract] = useState("");
  const [swapContract, setSwapContract] = useState("");
  const [donateContract, setDonateContract] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const storedAdmin = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
      if (adminAccount && adminAccount.toLowerCase() === storedAdmin) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [adminAccount]);

  const connectAdminWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAdminAccount(accounts[0]);
      } catch (error) {
        console.error("Admin Wallet Error:", error);
      }
    } else {
      alert("MetaMask not detected!");
    }
  };

  const updateContractSettings = async () => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_ADMIN_API_URL, {
        adminWallet: adminAccount,
        stakeFeeDeposit,
        stakeFeeWithdraw,
        sendFee,
        swapFee,
        donateFee,
        stakingContract,
        swapContract,
        donateContract,
      });
      alert("✅ Settings Updated Successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">👑 Admin Panel</h1>

      {!adminAccount ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectAdminWallet}>
            🦊 Connect Admin Wallet
          </button>
        </div>
      ) : isAdmin ? (
        <>
          <p className="wallet-address">✅ Connected as: {adminAccount.substring(0, 6)}...{adminAccount.slice(-4)}</p>

          <div className="admin-controls">
            <h2>🔧 Fees Management</h2>
            <label>📥 Staking Fee (Deposit %)</label>
            <input type="number" value={stakeFeeDeposit} onChange={(e) => setStakeFeeDeposit(e.target.value)} />
            
            <label>📤 Staking Fee (Withdraw %)</label>
            <input type="number" value={stakeFeeWithdraw} onChange={(e) => setStakeFeeWithdraw(e.target.value)} />

            <label>📨 Send Fee (%)</label>
            <input type="number" value={sendFee} onChange={(e) => setSendFee(e.target.value)} />

            <label>🔄 Swap Fee (%)</label>
            <input type="number" value={swapFee} onChange={(e) => setSwapFee(e.target.value)} />

            <label>🎗️ Donation Fee (%)</label>
            <input type="number" value={donateFee} onChange={(e) => setDonateFee(e.target.value)} />
            
            <h2>⚙️ Contract Management</h2>
            <label>📜 Staking Contract</label>
            <input type="text" value={stakingContract} onChange={(e) => setStakingContract(e.target.value)} placeholder="0x..." />

            <label>🔄 Swap Contract</label>
            <input type="text" value={swapContract} onChange={(e) => setSwapContract(e.target.value)} placeholder="0x..." />

            <label>🎗️ Donation Contract</label>
            <input type="text" value={donateContract} onChange={(e) => setDonateContract(e.target.value)} placeholder="0x..." />

            <button className="update-btn" onClick={updateContractSettings}>🚀 Update Settings</button>
          </div>
        </>
      ) : (
        <p className="error-text">⛔ Access Denied! You are not the admin.</p>
      )}
    </div>
  );
}
