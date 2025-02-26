import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const TOKEN_LIST = [
  { name: "BNB", symbol: "BNB", contract: null, decimals: 18 },
  { name: "USDT", symbol: "USDT", contract: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
  { name: "NordBaltic Staking Token", symbol: "NBT", contract: "your-staking-token-contract", decimals: 18 }
];

export default function TokenList({ provider, walletAddress }) {
  const [balances, setBalances] = useState({});

  useEffect(() => {
    if (provider && walletAddress) {
      fetchBalances();
    }
  }, [provider, walletAddress]);

  const fetchBalances = async () => {
    const newBalances = {};

    for (const token of TOKEN_LIST) {
      if (token.contract) {
        const contract = new ethers.Contract(
          token.contract,
          ["function balanceOf(address owner) view returns (uint256)"],
          provider
        );
        const balance = await contract.balanceOf(walletAddress);
        newBalances[token.symbol] = ethers.utils.formatUnits(balance, token.decimals);
      } else {
        const balance = await provider.getBalance(walletAddress);
        newBalances[token.symbol] = ethers.utils.formatEther(balance);
      }
    }

    setBalances(newBalances);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary p-6 rounded-lg shadow-dark"
    >
      <h2 className="text-secondary text-xl font-bold mb-4">Your Tokens</h2>
      <ul>
        {TOKEN_LIST.map((token) => (
          <li key={token.symbol} className="flex justify-between text-white py-2 border-b border-secondary">
            <span>{token.name} ({token.symbol})</span>
            <span>{balances[token.symbol] || "Loading..."}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
