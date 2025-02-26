import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react"; // ✅ QR kodų palaikymas
import "../styles/globals.css";

export default function Receive() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [currency, setCurrency] = useState("EUR"); // ✅ Numatytasis EUR
  const [convertedAmount, setConvertedAmount] = useState(null);

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

  const fetchConversionRate = async () => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      const data = await response.json();
      return data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!account) return;
    const convert = async () => {
      const rate = await fetchConversionRate();
      if (rate) {
        setConvertedAmount((1 * rate).toFixed(2));
      }
    };
    convert();
  }, [account, currency]);

  return (
    <div className="receive-container">
      <h1 className="receive-title">Receive Crypto</h1>
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
        <>
          <p className="wallet-address">Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>

          {/* ✅ QR kodas gavimo adresui */}
          <div className="qr-section">
            <p>Your Wallet Address:</p>
            <QRCode value={account} size={180} className="qr-code" />
            <p className="small-text">Scan the QR code to receive crypto.</p>
          </div>

          {/* ✅ Valiutos pasirinkimas */}
          <label>Show in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          {/* ✅ Konvertuota suma */}
          {convertedAmount && <p className="converted-amount">1 BNB ≈ {convertedAmount} {currency}</p>}
        </>
      )}
    </div>
  );
}
