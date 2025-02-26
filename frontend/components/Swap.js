// 📂 /frontend/components/Swap.js - MAX PREMIUM SWAP SYSTEM
import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

export default function Swap() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [fromToken, setFromToken] = useState("BNB");
  const [toToken, setToToken] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [swapFee, setSwapFee] = useState(0.2); // 0.2% swap fee iš smart contracto
  const [tokenPrices, setTokenPrices] = useState({});
  const [tokenLogos, setTokenLogos] = useState({});

  const walletContractAddress = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTokenPrices();
      fetchTokenLogos();
    }
  }, [account]);

  const fetchTokenPrices = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether&vs_currencies=usd`
      );
      setTokenPrices({
        BNB: response.data.binancecoin.usd,
        USDT: response.data.tether.usd,
      });
    } catch (error) {
      console.error("🔴 Klaida gaunant tokenų kainas:", error);
    }
  };

  const fetchTokenLogos = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/list`
      );
      const tokenData = response.data.reduce((acc, token) => {
        if (token.id === "binancecoin") acc["BNB"] = token.image;
        if (token.id === "tether") acc["USDT"] = token.image;
        return acc;
      }, {});
      setTokenLogos(tokenData);
    } catch (error) {
      console.error("🔴 Klaida gaunant tokenų logotipus:", error);
    }
  };

  const calculateEstimate = () => {
    if (!amount || !tokenPrices[fromToken] || !tokenPrices[toToken]) return;
    const fromPrice = tokenPrices[fromToken];
    const toPrice = tokenPrices[toToken];
    const swapAmount = (amount * fromPrice) / toPrice;
    const fee = swapAmount * (swapFee / 100);
    setEstimatedAmount((swapAmount - fee).toFixed(4));
  };

  useEffect(() => {
    calculateEstimate();
  }, [amount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!amount || !estimatedAmount || !web3) {
      alert("⚠️ Įveskite tinkamą sumą!");
      return;
    }

    try {
      const contract = new web3.eth.Contract(
        [
          {
            inputs: [
              { internalType: "address", name: "toToken", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "swapTokens",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
        ],
        walletContractAddress
      );

      await contract.methods.swapTokens(toToken, web3.utils.toWei(amount, "ether")).send({
        from: account,
        value: web3.utils.toWei(amount, "ether"),
      });

      alert("✅ Swap sėkmingas!");
    } catch (error) {
      console.error("❌ Swap nepavyko:", error);
      alert("❌ Swap nepavyko. Bandykite dar kartą.");
    }
  };

  return (
    <div className="swap-box">
      <h2>🔄 Swap</h2>

      <div className="token-select">
        <label>From:</label>
        <div className="token-dropdown">
          {tokenLogos[fromToken] && <img src={tokenLogos[fromToken]} alt={fromToken} className="token-logo" />}
          <select value={fromToken} onChange={(e) => setFromToken(e.target.value)}>
            <option value="BNB">BNB</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
      </div>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="token-select">
        <label>To:</label>
        <div className="token-dropdown">
          {tokenLogos[toToken] && <img src={tokenLogos[toToken]} alt={toToken} className="token-logo" />}
          <select value={toToken} onChange={(e) => setToToken(e.target.value)}>
            <option value="USDT">USDT</option>
            <option value="BNB">BNB</option>
          </select>
        </div>
      </div>

      <p>💱 Skaičiuojama: {estimatedAmount} {toToken}</p>
      <p>⚡ Swap Fee: {swapFee}%</p>

      <button className="swap-btn" onClick={handleSwap}>
        🚀 Swap Now
      </button>
    </div>
  );
}
