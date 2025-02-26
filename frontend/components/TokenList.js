// 📂 /frontend/components/TokenList.js
// ✅ Rodo vartotojo tokenus su balansais
// ✅ Pilna Web3 integracija

import { useState, useEffect } from "react";
import Web3 from "web3";

const tokenList = [
  { symbol: "BNB", address: "0x..." },
  { symbol: "USDT", address: "0x..." },
  { symbol: "CAKE", address: "0x..." }
];

export default function TokenList({ account }) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!account) return;

      const web3 = new Web3("https://bsc-dataseed.binance.org/");
      let updatedTokens = [];

      for (const token of tokenList) {
        const tokenContract = new web3.eth.Contract([
          { constant: true, inputs: [{ name: "_owner", type: "address" }], name: "balanceOf", outputs: [{ name: "balance", type: "uint256" }], type: "function" }
        ], token.address);

        const balance = await tokenContract.methods.balanceOf(account).call();
        updatedTokens.push({ symbol: token.symbol, balance: web3.utils.fromWei(balance, "ether") });
      }

      setTokens(updatedTokens);
    };

    fetchBalances();
  }, [account]);

  return (
    <div className="token-list">
      <h2>Your Tokens</h2>
      {tokens.length > 0 ? (
        <ul>
          {tokens.map((token, index) => (
            <li key={index}>
              <p><strong>{token.symbol}:</strong> {token.balance}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tokens found.</p>
      )}
    </div>
  );
}
