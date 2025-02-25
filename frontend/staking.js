// 📂 /frontend/pages/staking.js - Pilna staking sistema su automatiniais reward'ais
import { useState, useEffect } from 'react';
import { stakeBNB, getStakingBalance, claimRewards, unstakeBNB } from '../utils/staking';
import '../styles.css';

export default function Staking() {
  const [staked, setStaked] = useState(0);
  const [rewards, setRewards] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const stakedBalance = await getStakingBalance();
      setStaked(stakedBalance);
      const earnedRewards = await claimRewards();
      setRewards(earnedRewards);
    }
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 className="title">BNB Staking</h1>
      <p className="balance">Your Staked Balance: {staked} BNB</p>
      <p className="balance">Rewards: {rewards} BNB</p>
      <button className="connect-btn" onClick={() => stakeBNB()}>Stake BNB</button>
      <button className="connect-btn" onClick={() => claimRewards()}>Claim Rewards</button>
      <button className="connect-btn" onClick={() => unstakeBNB()}>Unstake BNB</button>
    </div>
  );
}
