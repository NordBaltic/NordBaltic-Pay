// 📂 /frontend/pages/admin.js - Pilna admin panelė su visomis valdymo funkcijomis
import { useState } from 'react';
import { banUser, unbanUser, freezeFunds, unfreezeFunds, adjustFees, confiscateFunds } from '../utils/admin';
import '../styles.css';

export default function Admin() {
  const [userAddress, setUserAddress] = useState('');
  const [feeType, setFeeType] = useState('');
  const [feeValue, setFeeValue] = useState('');
  const [confiscationAmount, setConfiscationAmount] = useState('');

  return (
    <div className="container">
      <h1 className="title">Admin Panel</h1>
      <div className="admin-actions">
        <h2>User Management</h2>
        <input type="text" placeholder="User Wallet Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} className="input-field" />
        <button className="connect-btn" onClick={() => banUser(userAddress)}>Ban User</button>
        <button className="connect-btn" onClick={() => unbanUser(userAddress)}>Unban User</button>
        <button className="connect-btn" onClick={() => freezeFunds(userAddress)}>Freeze Funds</button>
        <button className="connect-btn" onClick={() => unfreezeFunds(userAddress)}>Unfreeze Funds</button>
      </div>
      <div className="admin-actions">
        <h2>Fees Management</h2>
        <input type="text" placeholder="Fee Type (staking, transaction, etc.)" value={feeType} onChange={(e) => setFeeType(e.target.value)} className="input-field" />
        <input type="number" placeholder="New Fee %" value={feeValue} onChange={(e) => setFeeValue(e.target.value)} className="input-field" />
        <button className="connect-btn" onClick={() => adjustFees(feeType, feeValue)}>Set Fee</button>
      </div>
      <div className="admin-actions">
        <h2>Confiscate Funds</h2>
        <input type="text" placeholder="User Wallet Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} className="input-field" />
        <input type="number" placeholder="Amount to Confiscate (BNB)" value={confiscationAmount} onChange={(e) => setConfiscationAmount(e.target.value)} className="input-field" />
        <button className="connect-btn" onClick={() => confiscateFunds(userAddress, confiscationAmount)}>Confiscate</button>
      </div>
    </div>
  );
}
