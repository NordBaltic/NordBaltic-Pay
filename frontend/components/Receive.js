import { useState, useEffect } from "react";
import Web3 from "web3";
import QRCode from "qrcode.react";
import axios from "axios";
import "../styles/globals.css";

export default function Receive() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [convertedAmount, setConvertedAmount] = useState({ usd: "0.00", eur: "0.00" });
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
    }
  }, [account]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchConversionRate(balanceEth);
    } catch (error) {
      console.error("❌ Klaida gaunant balansą:", error);
    }
  };

  const fetchConversionRate = async (bnbAmount) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      const rates = response.data.binancecoin;
      setConvertedAmount({
        usd: (bnbAmount * rates.usd).toFixed(2),
        eur: (bnbAmount * rates.eur).toFixed(2),
      });
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("❌ MetaMask klaida:", error);
      }
    } else {
      alert("⚠️ MetaMask nerastas!");
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
      localStorage.setItem("walletAccount", accounts[0]);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("❌ WalletConnect klaida:", error);
    }
  };

  return (
    <div className="receive-container">
      <h1>📥 Receive Crypto</h1>
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            🔗 Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={connectMetaMask}>
            🦊 Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="balance-text">💰 Balance: {bnbBalance} BNB</p>

          <div className="qr-section">
            <p>Your Wallet Address:</p>
            <QRCode value={account} size={180} className="qr-code" />
            <p className="small-text">Scan the QR code to receive crypto.</p>
          </div>

          <label>Show in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">💶 EUR</option>
            <option value="USD">💵 USD</option>
          </select>

          {convertedAmount && (
            <p className="converted-amount">
              1 BNB ≈ {currency === "EUR" ? convertedAmount.eur : convertedAmount.usd} {currency}
            </p>
          )}
        </>
      )}
    </div>
  );
}
