import { useState, useEffect } from "react";
import Link from "next/link";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";
import Loader from "../components/Loader"; // ✅ Įtrauktas Loader.js
import "../styles/globals.css";

export default function Dashboard() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [eurBalance, setEurBalance] = useState("0.00");
  const [currency, setCurrency] = useState("USD");
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

      const rates = await fetchConversionRates();
      setUsdBalance((balanceEth * rates.usd).toFixed(2));
      setEurBalance((balanceEth * rates.eur).toFixed(2));
      setLoading(false);
    } catch (error) {
      console.error("Klaida gaunant balansą:", error);
      setLoading(false);
    }
  };

  const fetchConversionRates = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur");
      return response.data.binancecoin;
    } catch (error) {
      console.error("Klaida gaunant valiutos kursą:", error);
      return { usd: 1, eur: 1 };
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
      localStorage.setItem("walletAccount", accounts[0]);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard</h1>

      {loading ? <Loader /> : null}

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
          <div className="balance-section">
            <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
            <p className="balance-text">💰 Balance: {bnbBalance} BNB</p>
            <p className="balance-text">💵 USD: ${usdBalance} | 💶 EUR: €{eurBalance}</p>

            {/* ✅ QR kodas vartotojo adresui */}
            <div className="qr-section">
              <QRCode value={account} size={150} className="qr-code" />
              <p className="small-text">Scan QR code to receive funds</p>
            </div>

            {/* ✅ Valiutos pasirinkimas */}
            <label>Show in:</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">💵 USD</option>
              <option value="EUR">💶 EUR</option>
            </select>
          </div>

          {/* ✅ Pagrindiniai veiksmai */}
          <div className="dashboard-actions">
            <Link href="/send">
              <a className="action-btn">🚀 Send</a>
            </Link>
            <Link href="/receive">
              <a className="action-btn">📥 Receive</a>
            </Link>
            <Link href="/staking">
              <a className="action-btn">💸 Staking</a>
            </Link>
            <Link href="/donations">
              <a className="action-btn">❤️ Donate</a>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
