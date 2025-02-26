// 📂 /components/Swap.js - MAX PREMIUM Swap su Smart Contract
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import { ethers } from "ethers";

const WALLET_CONTRACT_ADDRESS = "0xYOUR_WALLET_CONTRACT_ADDRESS";
const UNISWAP_ROUTER_ADDRESS = "0xYOUR_UNISWAP_ROUTER_ADDRESS";

export default function Swap() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amount, setAmount] = useState("");
  const [swapFee, setSwapFee] = useState("0.2%");
  const [tokenList, setTokenList] = useState([]);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };

    loadAccount();
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/coins/list");
      setTokenList(response.data.slice(0, 50)); // Rodo pirmus 50 populiariausių tokenų
    } catch (error) {
      console.error("Error fetching token list:", error);
    }
  };

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amount) {
      alert("❌ Please fill all fields.");
      return;
    }

    try {
      setSwapFee("0.2% (Processing)");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WALLET_CONTRACT_ADDRESS, [
        "function swapTokens(address _tokenIn, address _tokenOut, uint256 _amount) external"
      ], signer);

      const tx = await contract.swapTokens(tokenIn, tokenOut, ethers.utils.parseUnits(amount, "ether"));
      await tx.wait();

      setSwapFee("0.2%");
      alert("✅ Swap Successful!");
    } catch (error) {
      console.error("Swap failed:", error);
      alert("❌ Swap failed.");
      setSwapFee("0.2%");
    }
  };

  return (
    <div className="swap-container">
      <h2>🔄 Swap Crypto</h2>
      {!account ? (
        <button onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>Connect Wallet</button>
      ) : (
        <div>
          <p>✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <label>Select Token to Swap</label>
          <select value={tokenIn} onChange={(e) => setTokenIn(e.target.value)}>
            <option value="">Select Token</option>
            {tokenList.map((token) => (
              <option key={token.id} value={token.id}>{token.name}</option>
            ))}
          </select>
          <label>Swap to</label>
          <select value={tokenOut} onChange={(e) => setTokenOut(e.target.value)}>
            <option value="">Select Token</option>
            {tokenList.map((token) => (
              <option key={token.id} value={token.id}>{token.name}</option>
            ))}
          </select>
          <label>Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
          <p>📉 Swap Fee: {swapFee}</p>
          <button onClick={handleSwap}>🔄 Swap Now</button>
        </div>
      )}
    </div>
  );
}
