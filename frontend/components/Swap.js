import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import "../styles/globals.css";

export default function Swap() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [tokenFrom, setTokenFrom] = useState("BNB");
  const [tokenTo, setTokenTo] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState("0.00");
  const [swapFee, setSwapFee] = useState("0.2%");
  const [loading, setLoading] = useState(true);

  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
  const swapContract = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;

  const tokens = [
    { name: "BNB", symbol: "BNB", contract: "0xBNBContract", logo: "/images/bnb.png" },
    { name: "USD Tether", symbol: "USDT", contract: "0xUSDTContract", logo: "/images/usdt.png" },
    { name: "Ethereum", symbol: "ETH", contract: "0xETHContract", logo: "/images/eth.png" },
    { name: "NordBaltic Token", symbol: "NBT", contract: "0xNBTContract", logo: "/images/nbt.png" },
  ];

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchExchangeRate();
    }
  }, [account, tokenFrom, tokenTo]);

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenFrom.toLowerCase()},${tokenTo.toLowerCase()}&vs_currencies=usd`
      );
      setExchangeRate(response.data);
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
    }
  };

  useEffect(() => {
    if (!amount || !exchangeRate) return;
    const rate = exchangeRate[tokenFrom.toLowerCase()].usd / exchangeRate[tokenTo.toLowerCase()].usd;
    setConvertedAmount((parseFloat(amount) * rate).toFixed(4));
  }, [amount, exchangeRate]);

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const sendAmount = web3.utils.toWei(amount, "ether");
      const fee = web3.utils.toWei((parseFloat(amount) * 0.002).toFixed(4), "ether"); // 0.2% fee
      const netAmount = sendAmount - fee;

      await web3.eth.sendTransaction({
        from: account,
        to: swapContract,
        value: netAmount,
        gas: 21000,
      });

      await web3.eth.sendTransaction({
        from: account,
        to: adminWallet,
        value: fee,
        gas: 21000,
      });

      console.log(`✅ Swap Complete: ${amount} ${tokenFrom} → ${convertedAmount} ${tokenTo}`);
    } catch (error) {
      console.error("❌ Klaida atliekant swap:", error);
    }
  };

  return (
    <div className="swap-container">
      <h2>🔄 Swap Crypto</h2>
      <p>Swap tokens with instant execution and a 0.2% fee.</p>

      <label>From:</label>
      <select value={tokenFrom} onChange={(e) => setTokenFrom(e.target.value)}>
        {tokens.map((token) => (
          <option key={token.symbol} value={token.symbol}>
            {token.name} ({token.symbol})
          </option>
        ))}
      </select>

      <label>To:</label>
      <select value={tokenTo} onChange={(e) => setTokenTo(e.target.value)}>
        {tokens.map((token) => (
          <option key={token.symbol} value={token.symbol}>
            {token.name} ({token.symbol})
          </option>
        ))}
      </select>

      <label>Amount:</label>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />

      <p className="swap-fee">📌 Swap Fee: {swapFee} (Sent to admin wallet)</p>

      <button className="swap-btn" onClick={handleSwap}>🚀 Swap Now</button>

      <h3>📈 Live Exchange Rate</h3>
      {convertedAmount && (
        <p className="converted-amount">
          {amount} {tokenFrom} ≈ {convertedAmount} {tokenTo}
        </p>
      )}
    </div>
  );
}
