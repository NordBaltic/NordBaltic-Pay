import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

const SwapComponent = ({ account, web3, onTransactionComplete }) => {
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("BNB");
  const [swapTo, setSwapTo] = useState("USDT");
  const [balanceFrom, setBalanceFrom] = useState("0.00");
  const [balanceTo, setBalanceTo] = useState("0.00");
  const [swapRate, setSwapRate] = useState(null);
  const [swapProcessing, setSwapProcessing] = useState(false);
  const WALLET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  const tokenList = [
    { symbol: "BNB", address: "0x...", logo: "https://assets.coingecko.com/coins/images/825/thumb/binance-coin-logo.png" },
    { symbol: "USDT", address: "0x...", logo: "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png" },
    { symbol: "ETH", address: "0x...", logo: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
    { symbol: "BTCB", address: "0x...", logo: "https://assets.coingecko.com/coins/images/8256/thumb/binance-btc.png" },
  ];

  useEffect(() => {
    if (account && web3) {
      fetchBalance(swapFrom, setBalanceFrom);
      fetchBalance(swapTo, setBalanceTo);
      fetchSwapRate();
    }
  }, [account, web3, swapFrom, swapTo]);

  const fetchBalance = async (token, setBalance) => {
    try {
      if (token === "BNB") {
        const balanceWei = await web3.eth.getBalance(account);
        setBalance(web3.utils.fromWei(balanceWei, "ether"));
      } else {
        setBalance("0.00"); // ERC20 tokenų balansų funkcija vėliau
      }
    } catch (error) {
      console.error(`🔴 Klaida gaunant ${token} balansą:`, error);
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

    if (parseFloat(swapAmount) > parseFloat(balanceFrom)) {
      alert("🚨 Nepakankamas balansas!");
      return;
    }

    setSwapProcessing(true);

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

    setSwapProcessing(false);
  };

  return (
    <div className="swap-container">
      <h1>🔄 Token Swap</h1>

      <div className="swap-inputs">
        <label>From:</label>
        <div className="swap-selection">
          <img src={tokenList.find(t => t.symbol === swapFrom).logo} alt={swapFrom} className="token-logo" />
          <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)}>
            {tokenList.map(token => (
              <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
            ))}
          </select>
        </div>
        <p className="wallet-balance">💰 Balansas: {balanceFrom} {swapFrom}</p>

        <label>To:</label>
        <div className="swap-selection">
          <img src={tokenList.find(t => t.symbol === swapTo).logo} alt={swapTo} className="token-logo" />
          <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)}>
            {tokenList.map(token => (
              <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
            ))}
          </select>
        </div>
        <p className="wallet-balance">💰 Balansas: {balanceTo} {swapTo}</p>

        <label>Amount:</label>
        <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.01" />
      </div>

      {swapRate && <p className="swap-rate">1 {swapFrom} ≈ {swapRate.toFixed(6)} {swapTo}</p>}

      <button className="swap-btn" onClick={executeSwap} disabled={swapProcessing || !swapAmount || parseFloat(swapAmount) > parseFloat(balanceFrom)}>
        {swapProcessing ? "⏳ Processing..." : "⚡ Swap Now"}
      </button>
    </div>
  );
};

export default SwapComponent;
