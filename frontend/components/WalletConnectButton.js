// 📂 /frontend/components/WalletConnectButton.js
// ✅ PRISIJUNGIMO MYGTUKAS SU WALLETCONNECT IR METAMASK + ATSIJUNGIMAS

import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function WalletConnectButton({ onConnect, onDisconnect }) {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
          onConnect(accounts[0], web3Instance);
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };

    loadAccount();
  }, [onConnect]);

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      onConnect(accounts[0], web3Instance);
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    onDisconnect();
  };

  return (
    <div className="wallet-connect-container">
      {account ? (
        <div className="wallet-info">
          <p className="wallet-address">Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <button className="disconnect-btn" onClick={disconnectWallet}>
            Logout
          </button>
        </div>
      ) : (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            Connect with WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            Connect with MetaMask
          </button>
        </div>
      )}
    </div>
  );
}
