// 📂 /frontend/components/TokenList.js
import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";

export default function TokenList({ account }) {
  const [tokens, setTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("usd"); // Galima rinktis EUR arba USD
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    if (account) {
      fetchTokens();
      fetchExchangeRates();
    }
  }, [account, currency]);

  // 🔥 Gauti rinkos kursus (USD ir EUR)
  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/exchange_rates");
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  // 🔥 Gauti visus vartotojo tokenus iš BSCScan
  const fetchTokens = async () => {
    try {
      const web3 = new Web3("https://bsc-dataseed.binance.org/");
      const tokenListUrl = `https://api.bscscan.com/api?module=account&action=tokenlist&address=${account}&apikey=YourBscScanAPIKey`;
      const response = await axios.get(tokenListUrl);

      if (response.data.status === "1") {
        const enrichedTokens = await Promise.all(
          response.data.result.map(async (token) => {
            const balance = await web3.eth.getBalance(account);
            const tokenPriceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${token.tokenName.toLowerCase()}&vs_currencies=usd,eur`;
            const priceResponse = await axios.get(tokenPriceUrl);

            return {
              name: token.tokenName,
              symbol: token.tokenSymbol,
              balance: web3.utils.fromWei(balance, "ether"),
              price: priceResponse.data[token.tokenName.toLowerCase()] || { usd: 0, eur: 0 },
              logo: token.tokenLogo || "https://via.placeholder.com/50",
            };
          })
        );

        setTokens(enrichedTokens);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  return (
    <div className="token-list-container">
      <h2 className="token-list-title">My Tokens</h2>

      {/* 🔥 Valiutos pasirinkimas */}
      <div className="currency-switch">
        <label>Select Currency: </label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
        </select>
      </div>

      {/* 🔥 Paieška */}
      <input
        type="text"
        className="token-search"
        placeholder="Search token..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="token-list">
        {tokens
          .filter((token) =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((token, index) => (
            <div key={index} className="token-card">
              <img src={token.logo} alt={token.symbol} className="token-logo" />
              <div className="token-info">
                <h3>{token.name} ({token.symbol})</h3>
                <p>Balance: {token.balance}</p>
                <p>Value: {currency === "usd" ? `$${(token.balance * token.price.usd).toFixed(2)}` : `€${(token.balance * token.price.eur).toFixed(2)}`}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
