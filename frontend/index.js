// 📂 nordbaltic-pay (Pagrindinė sistema)
// Ši sistema apima visus failus: frontend (Next.js), backend (Node.js + Supabase), smart contract (Solidity)
// Failai bus pateikiami tvarkingai, nuo pirmo iki paskutinio – kad galėtum įkelti į GitHub ir paleisti per Vercel.

// 📂 /frontend/pages/index.js - Pagrindinis puslapis su prisijungimu, staking ir transakcijų valdymu
import { useState, useEffect } from 'react';
import { connectWallet, getWalletBalance } from '../utils/web3';
import Link from 'next/link';
import '../styles.css';

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (wallet) {
      getWalletBalance(wallet).then(setBalance);
    }
  }, [wallet]);

  return (
    <div className="container">
      <h1 className="title">NordBaltic Pay</h1>
      <button className="connect-btn" onClick={async () => setWallet(await connectWallet())}>
        {wallet ? 'Connected' : 'Connect Wallet'}
      </button>
      <p className="balance">Balance: {balance} BNB</p>
      <div className="links">
        <Link href="/staking" className="nav-link">Staking</Link>
        <Link href="/admin" className="nav-link">Admin Panel</Link>
        <Link href="/donate" className="nav-link">Donate</Link>
      </div>
    </div>
  );
}
