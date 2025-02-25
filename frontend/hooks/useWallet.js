// 📂 /frontend/hooks/useWallet.js - Custom hook piniginės valdymui
import { useState, useEffect } from 'react';
import { connectWallet, getWalletBalance } from '../utils/web3';

export default function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (wallet) {
      getWalletBalance(wallet).then(setBalance);
    }
  }, [wallet]);

  const connect = async () => {
    const account = await connectWallet();
    setWallet(account);
  };

  return { wallet, balance, connect };
}
