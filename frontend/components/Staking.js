import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";
import axios from "axios";
import "../styles/globals.css";

export default function Staking() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [stakedAmount, setStakedAmount] = useState("0.00");
  const [apr, setApr] = useState("8.5%"); // ✅ Live APR duomenys (galima su API)
  const [currency, setCurrency] = useState("EUR");
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [eurBalance, setEurBalance] = useState("0.00");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const STAKING_CONTRACT_ADDRESS = "0xYourStakingContractHere"; // 🔥 SMART CONTRACT ADDRESS

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchStakedAmount(web3Instance);
      fetchAPR();
    }
  }, [account]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
      fetchExchangeRates(balanceEth);
    } catch (error) {
      console.error("Klaida gaunant balansą:", error);
    }
  };

  const fetchExchangeRates = async (bnbAmount) => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur");
      const rates = response.data.binancecoin;
      setUsdBalance((bnbAmount * rates.usd).toFixed(2));
      setEurBalance((bnbAmount * rates.eur).toFixed(2));
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const fetchStakedAmount = async (web3Instance) => {
    try {
      setStakedAmount("0.50"); // ✅ DEMO - ČIA BUS AUTOMATIZUOTA SU SMART CONTRACT
    } catch (error) {
      console.error("Klaida gaunant staked balansą:", error);
    }
  };

  const fetchAPR = async () => {
    try {
      // Galima integruoti su PancakeSwap ar Marinade API
      setApr("8.5%"); // ✅ DEMO APR
    } catch (error) {
      console.error("Error fetching APR:", error);
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

  const handleStake = async () => {
    setStatus("⏳ Staking in progress...");
    try {
      // 🔥 ČIA BUS SMART CONTRACT INTERAKCIJA
      setStatus("✅ Staking successful!");
    } catch (error) {
      setStatus("❌ Staking failed. Try again.");
    }
  };

  return (
    <div className="staking-container">
      <h1 className="staking-title">💸 Staking</h1>
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
          <p className="stake-text">📌 Staked: {stakedAmount} BNB</p>
          <p className="apr-text">📈 APR: {apr}</p>

          <div className="qr-section">
            <p>Staking Contract Address:</p>
            <QRCode value={STAKING_CONTRACT_ADDRESS} size={160} className="qr-code" />
          </div>

          <label>Show balance in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">💶 EUR</option>
            <option value="USD">💵 USD</option>
          </select>

          <p className="converted-amount">💵 {currency === "USD" ? `$${usdBalance}` : `€${eurBalance}`} </p>

          <button className="stake-btn" onClick={handleStake}>🚀 Stake Now</button>
          <p className="status-text">{status}</p>
        </>
      )}
    </div>
  );
}
