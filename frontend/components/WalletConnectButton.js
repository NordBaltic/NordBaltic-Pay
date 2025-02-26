// 📂 /frontend/components/WalletConnectButton.js
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";

export default function WalletConnectButton({ onConnect }) {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [walletType, setWalletType] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
          setWalletType("MetaMask");
          onConnect(accounts[0], web3Instance);
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };

    if (!account) {
      loadAccount();
    }
  }, [onConnect]);

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
      onConnect(accounts[0], web3Instance);
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
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
      onConnect(accounts[0], web3Instance);
    } catch (error) {
      console.error("Error connecting with Coinbase Wallet", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setWalletType(null);
  };

  return (
    <div className="wallet-connect-container">
      {account ? (
        <div className="wallet-info">
          <p className="wallet-address">Connected: {account.substring(0, 6)}...{account.slice(-4)} ({walletType})</p>
          {walletType === "WalletConnect" && <QRCode value={account} size={120} />}
          <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
            Disconnect
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
          <button className="wallet-connect-btn" onClick={connectCoinbaseWallet}>
            Connect with Coinbase Wallet
          </button>
        </div>
      )}
    </div>
  );
}
