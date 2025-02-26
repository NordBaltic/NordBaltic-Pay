// 📂 /frontend/components/Swap.js - PREMIUM SWAP SYSTEM WITH MULTI-TOKEN SUPPORT
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
  const [swapFee, setSwapFee] = useState(0.2);
  const [tokenPrices, setTokenPrices] = useState({});
  const [tokenList, setTokenList] = useState([]);
  const [tokenLogos, setTokenLogos] = useState({});
  
  const walletContractAddress = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTokenData();
    }
  }, [account]);

  const fetchTokenData = async () => {
    try {
      const tokenIDs = ["binancecoin", "tether", "usd-coin", "ethereum", "wrapped-bitcoin"];
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIDs.join(",")}&vs_currencies=usd`
      );
      setTokenPrices({
        BNB: response.data.binancecoin.usd,
        USDT: response.data.tether.usd,
        USDC: response.data["usd-coin"].usd,
        ETH: response.data.ethereum.usd,
        WBTC: response.data["wrapped-bitcoin"].usd,
      });

      const tokenInfo = await axios.get(`https://api.coingecko.com/api/v3/coins/list`);
      const logos = tokenInfo.data.reduce((acc, token) => {
        if (token.id === "binancecoin") acc["BNB"] = token.image;
        if (token.id === "tether") acc["USDT"] = token.image;
        if (token.id === "usd-coin") acc["USDC"] = token.image;
        if (token.id === "ethereum") acc["ETH"] = token.image;
        if (token.id === "wrapped-bitcoin") acc["WBTC"] = token.image;
        return acc;
      }, {});
      setTokenLogos(logos);

      setTokenList(["BNB", "USDT", "USDC", "ETH", "WBTC"]);
    } catch (error) {
      console.error("🔴 Klaida gaunant tokenų duomenis:", error);
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
            {tokenList.map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
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
            {tokenList.map((token) => (
              <option key={token} value={token}>{token}</option>
            ))}
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
