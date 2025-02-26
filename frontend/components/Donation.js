import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";
import axios from "axios";
import "../styles/globals.css";

export default function Donation() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [walletType, setWalletType] = useState(localStorage.getItem("walletType") || null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState("0.00");
  const [status, setStatus] = useState("");
  const [selectedFund, setSelectedFund] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [funds, setFunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const DONATION_CONTRACT_ADDRESS = "0xYourDonationSmartContract"; // 🔥 SMART CONTRACT ADDRESS

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchFundsFromSmartContract();
    }
  }, [account]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (account && web3) fetchBalance(web3, account);
    }, 60000);
    return () => clearInterval(interval);
  }, [account, web3]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchExchangeRates(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchExchangeRates = async (bnbAmount) => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur,gbp,jpy,aud");
      const rates = response.data.binancecoin;
      const rate = rates[currency.toLowerCase()];
      setConvertedAmount((bnbAmount * rate).toFixed(2));
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const fetchFundsFromSmartContract = async () => {
    try {
      setFunds([
        { name: "Red Cross", address: "0xFUND1", description: "Global humanitarian aid." },
        { name: "Save the Children", address: "0xFUND2", description: "Helping children worldwide." },
        { name: "WWF", address: "0xFUND3", description: "Protecting nature and wildlife." },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching donation funds:", error);
    }
  };

  const connectWallet = async (type) => {
    try {
      let provider;
      let web3Instance;
      let accounts;

      if (type === "MetaMask" && window.ethereum) {
        web3Instance = new Web3(window.ethereum);
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      } else if (type === "WalletConnect") {
        provider = new WalletConnectProvider({ rpc: { 56: "https://bsc-dataseed.binance.org/" } });
        await provider.enable();
        web3Instance = new Web3(provider);
        accounts = await web3Instance.eth.getAccounts();
      } else if (type === "Coinbase") {
        const coinbaseWallet = new CoinbaseWalletSDK({ appName: "NordBaltic Pay" });
        provider = coinbaseWallet.makeWeb3Provider("https://bsc-dataseed.binance.org/", 56);
        web3Instance = new Web3(provider);
        accounts = await web3Instance.eth.getAccounts();
      }

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setWalletType(type);
      localStorage.setItem("walletAccount", accounts[0]);
      localStorage.setItem("walletType", type);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDonate = async () => {
    if (!selectedFund || !donationAmount) {
      setStatus("❌ Please select a fund and enter an amount.");
      return;
    }

    try {
      setStatus("⏳ Processing donation...");
      const sendAmount = web3.utils.toWei(donationAmount, "ether");
      await web3.eth.sendTransaction({
        from: account,
        to: selectedFund,
        value: sendAmount,
        gas: 21000,
      });
      setStatus("✅ Donation successful!");
    } catch (error) {
      console.error("Donation Failed", error);
      setStatus("❌ Donation failed. Please try again.");
    }
  };

  return (
    <div className="donation-container">
      <h1 className="donation-title">❤️ Donate to Charity</h1>
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={() => connectWallet("WalletConnect")}>
            🔗 Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("MetaMask")}>
            🦊 Connect MetaMask
          </button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("Coinbase")}>
            🏦 Connect Coinbase Wallet
          </button>
        </div>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)} ({walletType})</p>
          <p className="balance-text">💰 Balance: {bnbBalance} BNB</p>

          {isLoading ? (
            <p>Loading donation funds...</p>
          ) : (
            <div className="fund-list">
              {funds.map((fund, index) => (
                <div key={index} className={`fund-card ${selectedFund === fund.address ? "selected" : ""}`} onClick={() => setSelectedFund(fund.address)}>
                  <h3>{fund.name}</h3>
                  <p>{fund.description}</p>
                  <QRCode value={fund.address} size={120} className="qr-code" />
                </div>
              ))}
            </div>
          )}

          <label>Donation Amount (BNB)</label>
          <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="0.01" />

          <label>Show balance in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">💶 EUR</option>
            <option value="USD">💵 USD</option>
            <option value="GBP">💷 GBP</option>
            <option value="JPY">💴 JPY</option>
            <option value="AUD">🇦🇺 AUD</option>
          </select>

          <button className="donate-btn" onClick={handleDonate}>🚀 Donate Now</button>
          <p className="status-text">{status}</p>
        </>
      )}
    </div>
  );
}
