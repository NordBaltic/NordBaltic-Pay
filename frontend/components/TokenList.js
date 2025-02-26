import { useState, useEffect } from 'react';
import Web3 from 'web3';

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum,tether&vs_currencies=usd";

export default function TokenList({ account }) {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (account) {
      fetchTokens();
    }
  }, [account]);

  const fetchTokens = async () => {
    try {
      const response = await fetch(COINGECKO_API);
      const prices = await response.json();

      const tokenData = [
        { name: "Binance Coin", symbol: "BNB", balance: "2.5", icon: "/icons/bnb.png", price: prices.binancecoin.usd },
        { name: "Ethereum", symbol: "ETH", balance: "1.2", icon: "/icons/eth.png", price: prices.ethereum.usd },
        { name: "USD Tether", symbol: "USDT", balance: "500", icon: "/icons/usdt.png", price: prices.tether.usd },
      ];

      setTokens(tokenData);
    } catch (error) {
      console.error("Error fetching token prices:", error);
    }
  };

  return (
    <div className="token-list">
      <h2>My Assets</h2>
      <ul>
        {tokens.map((token, index) => (
          <li key={index} className="token-item">
            <img src={token.icon} alt={token.symbol} className="token-icon" />
            <span>{token.name} ({token.symbol})</span>
            <span className="balance">{token.balance} (~${(token.balance * token.price).toFixed(2)})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
