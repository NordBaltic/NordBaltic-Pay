import { useEffect, useState } from "react";
import axios from "axios";

const TokenList = ({ web3, account }) => {
  const [tokens, setTokens] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // Palaikomų tokenų sąrašas (galima papildyti)
    const supportedTokens = [
      { symbol: "BNB", address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 },
      { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
      { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", decimals: 18 },
    ];

    setTokens(supportedTokens);
  }, []);

  useEffect(() => {
    // Gauti realaus laiko kainas
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,binance-usd&vs_currencies=usd"
        );
        setPrices({
          BNB: response.data.binancecoin.usd,
          USDT: response.data.tether.usd,
          BUSD: response.data["binance-usd"].usd,
        });
      } catch (error) {
        console.error("Klaida gaunant kainas:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Atnaujiname kas 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="token-list">
      <h2>Token Portfolio</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Balance</th>
            <th>Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.symbol}>
              <td>{token.symbol}</td>
              <td>
                {account
                  ? web3.utils.fromWei("1000000000000000000", "ether") // Čia įdėk balansų gavimą iš blockchain
                  : "-"}
              </td>
              <td>${prices[token.symbol] ? prices[token.symbol].toFixed(2) : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenList;
