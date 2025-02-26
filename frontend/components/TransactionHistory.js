// 📂 /frontend/components/TransactionHistory.js - MAX PREMIUM TRANSACTION LIST
import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Link from "next/link";
import QRCode from "qrcode.react";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!account) return;

    const fetchTransactions = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
        const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

        const response = await axios.get(url);
        if (response.data.status === "1") {
          setTransactions(response.data.result);
        } else {
          console.error("BSCScan API klaida:", response.data.message);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Klaida gaunant tranzakcijas:", error);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 60000);
    return () => clearInterval(interval);
  }, [account]);

  // Prisijungimo funkcijos
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
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
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  return (
    <div className="transaction-history">
      <div className="navbar">
        <h2>📜 Transaction History</h2>
        <div className="menu">
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <Link href="/dashboard">🏠 Dashboard</Link>
              <Link href="/staking">💸 Staking</Link>
              <Link href="/donations">❤️ Donations</Link>
              <Link href="/wallet">👛 Wallet</Link>
              <Link href="/settings">⚙️ Settings</Link>
            </div>
          )}
        </div>
      </div>

      {/* Prisijungimo logika */}
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectMetaMask}>
            Connect with MetaMask
          </button>
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            Connect with WalletConnect
          </button>
        </div>
      ) : (
        <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
      )}

      {/* Tranzakcijų sąrašas */}
      {isLoading ? (
        <p>Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <div className="transaction-list">
          {transactions.map((tx) => {
            const status = tx.isError === "0" ? "✅ Completed" : "❌ Failed";
            return (
              <div key={tx.hash} className={`transaction ${tx.isError === "0" ? "success" : "failed"}`}>
                <div className="transaction-details">
                  <p><strong>Tx Hash:</strong> {tx.hash.substring(0, 10)}...{" "}
                    <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                      🔍 View on BSCScan
                    </a>
                  </p>
                  <p><strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}</p>
                  <p><strong>To:</strong> {tx.to.substring(0, 6)}...{tx.to.slice(-4)}</p>
                  <p><strong>Value:</strong> {parseFloat(tx.value) / 10 ** 18} BNB</p>
                  <p><strong>Date:</strong> {new Date(tx.timeStamp * 1000).toLocaleString()}</p>
                  <p><strong>Status:</strong> {status}</p>
                </div>
                <div className="qr-code">
                  <QRCode value={`https://bscscan.com/tx/${tx.hash}`} size={60} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
