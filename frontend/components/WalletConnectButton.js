import { useState, useEffect } from 'react';
import Web3 from 'web3';

export default function WalletConnectButton() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      alert("No Web3 provider found. Please install MetaMask.");
    }
  };

  return (
    <button className="wallet-connect-btn" onClick={connectWallet}>
      {account ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
