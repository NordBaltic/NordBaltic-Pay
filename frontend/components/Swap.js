import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";
import SwapContractABI from "../contracts/SwapContractABI.json";
import "../styles/globals.css";

export default function Swap() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [swapContract, setSwapContract] = useState(null);
  const [fromToken, setFromToken] = useState("BNB");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [swapFee, setSwapFee] = useState("0.2%");
  const [tokenRates, setTokenRates] = useState({});
  const swapContractAddress = "YOUR_SWAP_CONTRACT_ADDRESS"; // 🔹 Pakeisti į smart contract adresą

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contract = new web3Instance.eth.Contract(SwapContractABI, swapContractAddress);
      setSwapContract(contract);
    }
  }, [account]);

  useEffect(() => {
    fetchTokenRates();
  }, [fromToken, toToken, currency]);

  const fetchTokenRates = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,ethereum,usd-coin&vs_currencies=usd,eur`
      );
      setTokenRates(response.data);
    } catch (error) {
      console.error("Klaida gaunant valiutų kursus:", error);
    }
  };

  const getConvertedAmount = () => {
    if (amount && tokenRates[fromToken.toLowerCase()] && tokenRates[toToken.toLowerCase()]) {
      const fromRate = tokenRates[fromToken.toLowerCase()][currency.toLowerCase()];
      const toRate = tokenRates[toToken.toLowerCase()][currency.toLowerCase()];
      const estimatedAmount = (parseFloat(amount) * fromRate) / toRate;
      setConvertedAmount(estimatedAmount.toFixed(2));
    }
  };

  useEffect(() => {
    getConvertedAmount();
  }, [amount, tokenRates]);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
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
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  const handleSwap = async () => {
    if (!swapContract || !amount || parseFloat(amount) <= 0) {
      alert("Įveskite sumą!");
      return;
    }

    try {
      const swapAmount = web3.utils.toWei(amount, "ether");
      setSwapFee("⏳ Swapping...");

      await swapContract.methods
        .swapTokens(fromToken, toToken, swapAmount)
        .send({ from: account });

      setSwapFee("✅ Swap Completed!");
    } catch (error) {
      console.error("Swap failed:", error);
      setSwapFee("❌ Swap Failed");
    }
  };

  return (
    <div className="swap-container">
      <h1 className="swap-title">Swap Crypto</h1>
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
          <div className="swap-form">
            <label>From:</label>
            <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
              <option value="BNB">BNB</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>

            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />

            <label>To:</label>
            <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
              <option value="BNB">BNB</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>

            <label>Show in:</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">💵 USD</option>
              <option value="EUR">💶 EUR</option>
            </select>

            {convertedAmount && (
              <p className="converted-amount">
                ≈ {convertedAmount} {currency}
              </p>
            )}

            <p className="swap-fee">Swap Fee: {swapFee}</p>
            <button className="swap-btn" onClick={handleSwap}>🔄 Swap Now</button>
          </div>
        </>
      )}
    </div>
  );
}
