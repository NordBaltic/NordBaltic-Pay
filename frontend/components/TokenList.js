import { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokens from "../utils/tokens.json"; // Sąrašas palaikomų tokenų

export default function TokenList({ provider, walletAddress }) {
  const [balances, setBalances] = useState({});

  useEffect(() => {
    if (provider && walletAddress) {
      fetchBalances();
    }
  }, [provider, walletAddress]);

  const fetchBalances = async () => {
    const newBalances = {};
    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(token.address, token.abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        newBalances[token.symbol] = ethers.utils.formatUnits(balance, token.decimals);
      } catch (error) {
        console.error(`Failed to fetch balance for ${token.symbol}:`, error);
        newBalances[token.symbol] = "0";
      }
    }
    setBalances(newBalances);
  };

  return (
    <div className="token-list-container">
      <h2 className="title">Your Assets</h2>
      <ul className="token-list">
        {tokens.map((token) => (
          <li key={token.symbol} className="token-item">
            <img src={token.logo} alt={token.symbol} className="token-logo" />
            <span className="token-symbol">{token.symbol}</span>
            <span className="token-balance">{balances[token.symbol] || "0"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
