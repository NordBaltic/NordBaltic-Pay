// 📂 /frontend/hooks/useStaking.js - Custom hook staking sistemai
import { useState, useEffect } from 'react';
import { stakeBNB, getStakingBalance, claimRewards, unstakeBNB } from '../utils/staking';

export default function useStaking() {
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

  const stake = async (amount) => {
    await stakeBNB(amount);
    setStaked(await getStakingBalance());
  };

  const unstake = async (amount) => {
    await unstakeBNB(amount);
    setStaked(await getStakingBalance());
  };

  return { staked, rewards, stake, unstake };
}
