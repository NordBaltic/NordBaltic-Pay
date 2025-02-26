// 📂 /frontend/components/Receive.js
import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function Receive() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [copied, setCopied] = useState(false);

  // Automatinis prisijungimas
  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };
    loadAccount();
  }, []);

  // WalletConnect integracija
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
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
    }
  };

  // Kopijavimo funkcija su animacija
  const copyToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="receive-container">
      <h2 className="receive-title">Receive Funds</h2>
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="receive-content">
          <p className="wallet-address">
            ✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}
          </p>
          <QRCode value={account} size={200} level="H" className="qr-code" />
          <p className="qr-instruction">Scan this QR code to receive funds</p>
          <button className="copy-btn" onClick={copyToClipboard}>
            {copied ? "✅ Copied!" : "📋 Copy Address"}
          </button>
        </div>
      )}
    </div>
  );
}
