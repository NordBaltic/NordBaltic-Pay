import { useState, useEffect } from "react";
import Web3 from "web3";
import erc20ABI from "../utils/erc20ABI.json";

export default function TokenList({ account }) {
  const [tokens, setTokens] = useState([]);

  const tokenContracts = [
    { symbol: "BNB", address: "0x0000000000000000000000000000000000000000", decimals: 18 },
    { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", decimals: 18 },
  ];

  useEffect(() => {
    if (account) {
      loadBalances();
    }
  }, [account]);

  const loadBalances = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const balances = await Promise.all(
        tokenContracts.map(async (token) => {
          if (token.address === "0x0000000000000000000000000000000000000000") {
            const balance = await web3.eth.getBalance(account);
            return { symbol: token.symbol, balance: web3.utils.fromWei(balance, "ether") };
          } else {
            const contract = new web3.eth.Contract(erc20ABI, token.address);
            const balance = await contract.methods.balanceOf(account).call();
            return { symbol: token.symbol, balance: web3.utils.fromWei(balance, "ether") };
          }
        })
      );
      setTokens(balances);
    } catch (error) {
      console.error("Error loading token balances", error);
    }
  };

  return (
    <div className="token-list">
      <h2>My Tokens</h2>
      <ul>
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <li key={index} className="token-item">
              <span className="balance">{token.balance} {token.symbol}</span>
            </li>
          ))
        ) : (
          <p>Loading balances...</p>
        )}
      </ul>
    </div>
  );
}
