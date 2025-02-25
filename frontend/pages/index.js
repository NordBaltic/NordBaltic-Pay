// 📂 /frontend/pages/index.js - Pagrindinis puslapis su pilnu UI/UX
import { useState, useEffect } from 'react';
import useWallet from '../hooks/useWallet';
import useStaking from '../hooks/useStaking';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles.css';

export default function Home() {
  const { wallet, balance, connect } = useWallet();
  const { staked, rewards, stake, unstake } = useStaking();
  const [amount, setAmount] = useState('');

  return (
    <div className="container">
      <h1 className="title">Welcome to NordBaltic Pay</h1>
      {wallet ? (
        <>
          <Card title="Wallet Balance" content={`${balance} BNB`} />
          <Card title="Staked Balance" content={`${staked} BNB`} />
          <Card title="Rewards" content={`${rewards} BNB`} />
          <input type="number" placeholder="Amount in BNB" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
          <Button text="Stake" onClick={() => stake(amount)} />
          <Button text="Unstake" onClick={() => unstake(amount)} />
        </>
      ) : (
        <Button text="Connect Wallet" onClick={connect} />
      )}
    </div>
  );
}
