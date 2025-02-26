import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import { useTheme } from "../components/ThemeContext";
import "../styles/globals.css";

const Swap = () => {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("BNB");
  const [swapTo, setSwapTo] = useState("USDT");
  const [balance, setBalance] = useState("0.00");
  const [swapRate, setSwapRate] = useState(null);
  const { theme } = useTheme();

  const WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  const tokenList = [
    { symbol: "BNB", address: "0x...", logo: "/logos/bnb.png" },
    { symbol: "USDT", address: "0x...", logo: "/logos/usdt.png" },
    { symbol: "ETH", address: "0x...", logo: "/logos/eth.png" },
    { symbol: "BTCB", address: "0x...", logo: "/logos/btcb.png" },
  ];

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchSwapRate();
    }
  }, [account, swapFrom, swapTo]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));
    } catch (error) {
      console.error("🔴 Klaida gaunant balansą:", error);
    }
  };

  const fetchSwapRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${swapFrom.toLowerCase()},${swapTo.toLowerCase()}&vs_currencies=usd`);
      setSwapRate(response.data[swapFrom.toLowerCase()].usd / response.data[swapTo.toLowerCase()].usd);
    } catch (error) {
      console.error("🔴 Klaida gaunant swap kursą:", error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
        fetchBalance(web3Instance, accounts[0]);
      } catch (error) {
        console.error("🔴 MetaMask klaida:", error);
      }
    } else {
      alert("🚨 MetaMask nerastas!");
    }
  };

  const executeSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert("❌ Įveskite teisingą sumą!");
      return;
    }

    try {
      const sendAmount = web3.utils.toWei(swapAmount, "ether");
      await web3.eth.sendTransaction({
        from: account,
        to: WALLET_CONTRACT_ADDRESS,
        value: sendAmount,
        gas: 21000,
      });

      alert(`✅ Swap sėkmingas! ${swapAmount} ${swapFrom} → ${swapTo}`);
      fetchBalance(web3, account);
    } catch (error) {
      console.error("❌ Swap klaida:", error);
    }
  };

  return (
    <div className={`swap-container ${theme}`}>
      <h1>🔄 Token Swap</h1>

      {!account ? (
        <button className="wallet-connect-btn" onClick={connectWallet}>🔗 Connect Wallet</button>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="wallet-balance">💰 Balansas: {balance} {swapFrom}</p>

          {/* Swap pasirinkimai */}
          <div className="swap-inputs">
            <label>From:</label>
            <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)}>
              {tokenList.map(token => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>

            <label>To:</label>
            <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)}>
              {tokenList.map(token => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>

            <label>Amount:</label>
            <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.01" />
          </div>

          {/* Swap kursas */}
          {swapRate && <p className="swap-rate">1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}</p>}

          {/* Swap mygtukas */}
          <button className="swap-btn" onClick={executeSwap}>⚡ Swap Now</button>
        </>
      )}
    </div>
  );
};

export default Swap;
