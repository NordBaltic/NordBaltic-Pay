import { useState, useEffect } from "react";
import Web3 from "web3";
import SwapComponent from "../components/Swap";
import "../styles/globals.css";

export default function SwapPage() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
        }
      }
    };

    loadWeb3();
  }, []);

  return (
    <div className="swap-page-container">
      <h1>🔄 Swap Tokens</h1>
      {account ? <SwapComponent account={account} web3={web3} onTransactionComplete={() => {}} /> : <p>🔗 Please connect your wallet to swap.</p>}
    </div>
  );
}
