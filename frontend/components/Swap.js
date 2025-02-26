import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const SwapComponent = ({ account, web3, onTransactionComplete }) => {
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("BNB");
  const [swapTo, setSwapTo] = useState("USDT");
  const [balance, setBalance] = useState("0.00");
  const [swapRate, setSwapRate] = useState(null);
  const WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  const tokenList = [
    { symbol: "BNB", address: "0x...", logo: "/logos/bnb.png" },
    { symbol: "USDT", address: "0x...", logo: "/logos/usdt.png" },
    { symbol: "ETH", address: "0x...", logo: "/logos/eth.png" },
    { symbol: "BTCB", address: "0x...", logo: "/logos/btcb.png" },
  ];

  useEffect(() => {
    if (account && web3) {
      fetchBalance();
      fetchSwapRate();
    }
  }, [account, web3, swapFrom, swapTo]);

  const fetchBalance = async () => {
    try {
      const balanceWei = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(balanceWei, "ether"));
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

  const executeSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      alert("❌ Įveskite teisingą sumą!");
      return;
    }

    try {
      const sendAmount = web3.utils.toWei(swapAmount, "ether");
      const feeAmount = (parseFloat(swapAmount) * 0.002).toFixed(6);
      const feeWei = web3.utils.toWei(feeAmount, "ether");

      await web3.eth.sendTransaction({
        from: account,
        to: WALLET_CONTRACT_ADDRESS,
        value: feeWei,
        gas: 21000,
      });

      alert(`✅ Swap sėkmingas! ${swapAmount} ${swapFrom} → ${swapTo}`);
      onTransactionComplete();
    } catch (error) {
      console.error("❌ Swap klaida:", error);
    }
  };

  return (
    <div className="swap-container">
      <h1>🔄 Token Swap</h1>

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
    </div>
  );
};

export default SwapComponent;
