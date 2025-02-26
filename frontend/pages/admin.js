import { useState, useEffect } from "react";
import { banWallet, unbanWallet, freezeWalletFunds, unfreezeWalletFunds, adminManualTransfer, adminWithdrawFunds, getUserStatus } from "../utils/security";
import Web3 from "web3";

export default function AdminPage() {
  const [web3, setWeb3] = useState(null);
  const [adminWallet, setAdminWallet] = useState("");
  const [targetWallet, setTargetWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState({ isBanned: false, isFrozen: false });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      web3Instance.eth.getAccounts().then((accounts) => {
        setAdminWallet(accounts[0]);
      });
    }
  }, []);

  const checkStatus = async () => {
    const result = await getUserStatus(targetWallet);
    setStatus(result);
  };

  const handleBan = async () => {
    const response = await banWallet(targetWallet);
    setMessage(response);
    checkStatus();
  };

  const handleUnban = async () => {
    const response = await unbanWallet(targetWallet);
    setMessage(response);
    checkStatus();
  };

  const handleFreeze = async () => {
    const response = await freezeWalletFunds(targetWallet);
    setMessage(response);
    checkStatus();
  };

  const handleUnfreeze = async () => {
    const response = await unfreezeWalletFunds(targetWallet);
    setMessage(response);
    checkStatus();
  };

  const handleAdminTransfer = async () => {
    const response = await adminManualTransfer(targetWallet, amount);
    setMessage(response);
  };

  const handleAdminWithdraw = async () => {
    const response = await adminWithdrawFunds(targetWallet, amount);
    setMessage(response);
  };

  return (
    <div className="admin-container">
      <h1>🔧 Admin Panel</h1>

      <div className="admin-section">
        <h2>👤 User Management</h2>
        <input
          type="text"
          placeholder="Enter Wallet Address"
          value={targetWallet}
          onChange={(e) => setTargetWallet(e.target.value)}
        />
        <button onClick={checkStatus}>🔍 Check Status</button>
        {status.isBanned ? <p>🚨 User is BANNED</p> : <p>✅ User is Active</p>}
        {status.isFrozen ? <p>❄️ Funds are FROZEN</p> : <p>💰 Funds are Active</p>}

        <button onClick={handleBan} className="danger-btn">🚫 Ban User</button>
        <button onClick={handleUnban} className="success-btn">✅ Unban User</button>

        <button onClick={handleFreeze} className="danger-btn">❄️ Freeze Funds</button>
        <button onClick={handleUnfreeze} className="success-btn">🔥 Unfreeze Funds</button>
      </div>

      <div className="admin-section">
        <h2>💸 Fund Management</h2>
        <input
          type="text"
          placeholder="Enter Wallet Address"
          value={targetWallet}
          onChange={(e) => setTargetWallet(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount in BNB"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleAdminTransfer}>🚀 Send Funds</button>
        <button onClick={handleAdminWithdraw} className="danger-btn">💰 Withdraw Funds</button>
      </div>

      <p className="status-message">{message}</p>
    </div>
  );
        }
