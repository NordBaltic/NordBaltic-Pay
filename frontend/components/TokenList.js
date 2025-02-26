// 📂 /frontend/components/TokenList.js - MAX PREMIUM 3.0 TOKEN LIST
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [tokenPrices, setTokenPrices] = useState({});
  const [currency, setCurrency] = useState("usd");
  const [exchangeRates, setExchangeRates] = useState({ usd: 1, eur: 1 });
  const [network, setNetwork] = useState("");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    setNetwork(netId === 56 ? "BSC Mainnet" : "Unsupported Network");
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]); // 🔥 IŠSAUGO PRISIJUNGIMĄ
        detectNetwork(web3Instance);
      } catch (error) {
        console.error("MetaMask klaida:", error);
      }
    } else {
      alert("MetaMask nerastas!");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      localStorage.setItem("walletAccount", accounts[0]); // 🔥 IŠSAUGO PRISIJUNGIMĄ
      detectNetwork(web3Instance);
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.removeItem("walletAccount"); // 🔥 ATJUNGIA IR IŠVALO PRISIJUNGIMĄ
  };

  useEffect(() => {
    if (!account) return;

    const fetchTokens = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
        const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&address=${account}&apikey=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.status === "1") {
          setTokens(response.data.result);
          fetchTokenPrices(response.data.result);
        } else {
          console.error("BSCScan API klaida:", response.data.message);
        }
      } catch (error) {
        console.error("Klaida gaunant tokenus:", error);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 60000);
    return () => clearInterval(interval);
  }, [account]);

  const fetchTokenPrices = async (tokenList) => {
    try {
      const tokenSymbols = tokenList.map(token => token.tokenSymbol.toLowerCase()).join(",");
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbols},usd,eur&vs_currencies=usd,eur,market_cap`);
      
      setTokenPrices(response.data);
      setExchangeRates({
        usd: response.data.usd?.eur || 1,
        eur: response.data.eur?.usd || 1
      });

    } catch (error) {
      console.error("Error fetching token prices:", error);
    }
  };

  const formattedTokens = useMemo(() => {
    return tokens.map(token => {
      const balance = parseFloat(token.balance) / 10 ** token.tokenDecimal;
      const price = tokenPrices[token.tokenSymbol.toLowerCase()]?.[currency] || 0;
      const totalValue = (balance * price).toFixed(2);
      const marketCap = tokenPrices[token.tokenSymbol.toLowerCase()]?.market_cap || "N/A";

      return {
        ...token,
        balance,
        price,
        totalValue,
        marketCap,
        priceChange: tokenPrices[token.tokenSymbol.toLowerCase()]?.price_change_percentage_24h || 0
      };
    });
  }, [tokens, tokenPrices, currency]);

  return (
    <div className="token-list">
      <h2>💰 My Tokens</h2>
      <p className="network-status">🌐 {network}</p>
      <button className="currency-toggle" onClick={() => setCurrency(currency === "usd" ? "eur" : "usd")}>
        Show in {currency === "usd" ? "EUR" : "USD"}
      </button>

      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={connectMetaMask}>
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}

      {tokens.length > 0 ? (
        <table className="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Symbol</th>
              <th>Balance</th>
              <th>Price ({currency.toUpperCase()})</th>
              <th>Total Value</th>
              <th>Market Cap</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {formattedTokens.map((token) => (
              <tr key={token.contractAddress}>
                <td>{token.tokenName}</td>
                <td>{token.tokenSymbol}</td>
                <td>{token.balance}</td>
                <td>{currency.toUpperCase()} {token.price.toFixed(2)}</td>
                <td>{currency.toUpperCase()} {token.totalValue}</td>
                <td>${token.marketCap.toLocaleString()}</td>
                <td style={{ color: token.priceChange > 0 ? "green" : "red" }}>
                  {token.priceChange.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No tokens found.</p>
      )}
    </div>
  );
}
