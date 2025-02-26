// 📂 /frontend/components/WalletConnectButton.js - MAX PREMIUM WALLET CONNECT
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";

export default function WalletConnectButton({ onConnect }) {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [walletType, setWalletType] = useState(localStorage.getItem("walletType") || null);
  const [network, setNetwork] = useState("");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    const netName = netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network";
    setNetwork(netName);
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setWalletType("MetaMask");
        localStorage.setItem("walletAccount", accounts[0]); // 🔥 IŠSAUGO PRISIJUNGIMĄ
        localStorage.setItem("walletType", "MetaMask");
        detectNetwork(web3Instance);
        onConnect(accounts[0], web3Instance);
      } catch (error) {
        console.error("MetaMask klaida:", error);
      }
    } else {
      alert("MetaMask nerastas!");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
      });
      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      setWalletType("WalletConnect");
      localStorage.setItem("walletAccount", accounts[0]); // 🔥 IŠSAUGO PRISIJUNGIMĄ
      localStorage.setItem("walletType", "WalletConnect");
      detectNetwork(web3Instance);
      onConnect(accounts[0], web3Instance);
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  const connectCoinbaseWallet = async () => {
    try {
      const coinbaseWallet = new CoinbaseWalletSDK({ appName: "NordBaltic Pay" });
      const provider = coinbaseWallet.makeWeb3Provider("https://bsc-dataseed.binance.org/", 56);
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      setWalletType("Coinbase Wallet");
      localStorage.setItem("walletAccount", accounts[0]); // 🔥 IŠSAUGO PRISIJUNGIMĄ
      localStorage.setItem("walletType", "Coinbase Wallet");
      detectNetwork(web3Instance);
      onConnect(accounts[0], web3Instance);
    } catch (error) {
      console.error("Coinbase Wallet klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setWalletType(null);
    setNetwork("");
    localStorage.removeItem("walletAccount"); // 🔥 ATJUNGIA IR IŠVALO PRISIJUNGIMĄ
    localStorage.removeItem("walletType");
  };

  return (
    <div className="wallet-connect-container">
      {account ? (
        <div className="wallet-info">
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)} ({walletType})</p>
          <p className="network-status">{network}</p>
          {walletType === "WalletConnect" && <QRCode value={account} size={120} />}
          <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
            ❌ Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            🔗 Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={connectMetaMask}>
            🦊 Connect MetaMask
          </button>
          <button className="wallet-connect-btn" onClick={connectCoinbaseWallet}>
            🏦 Connect Coinbase Wallet
          </button>
        </div>
      )}
    </div>
  );
}
