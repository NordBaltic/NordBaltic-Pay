import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [tokenPrices, setTokenPrices] = useState({});
  const [currency, setCurrency] = useState("usd");
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({ usd: 1, eur: 1 });

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
  }, []);

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
    }
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
  }, [account]);

  const fetchTokenPrices = async (tokenList) => {
    try {
      const tokenSymbols = tokenList.map(token => token.tokenSymbol.toLowerCase()).join(",");
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbols},usd,eur&vs_currencies=usd,eur`);
      
      setTokenPrices(response.data);
      setExchangeRates({
        usd: response.data.usd.eur ? response.data.usd.eur : 1,
        eur: response.data.eur.usd ? response.data.eur.usd : 1
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching token prices:", error);
    }
  };

  return (
    <div className="token-list">
      <h2>💰 My Tokens</h2>
      <button className="currency-toggle" onClick={() => setCurrency(currency === "usd" ? "eur" : "usd")}>
        Show in {currency === "usd" ? "EUR" : "USD"}
      </button>
      
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            Connect MetaMask
          </button>
        </div>
      ) : (
        <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
      )}

      {isLoading ? (
        <p>Loading tokens...</p>
      ) : tokens.length > 0 ? (
        <table className="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Symbol</th>
              <th>Balance</th>
              <th>Price ({currency.toUpperCase()})</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => {
              const balance = parseFloat(token.balance) / 10 ** token.tokenDecimal;
              const price = tokenPrices[token.tokenSymbol.toLowerCase()]?.[currency] || 0;
              const totalValue = (balance * price).toFixed(2);

              return (
                <tr key={token.contractAddress}>
                  <td>{token.tokenName}</td>
                  <td>{token.tokenSymbol}</td>
                  <td>{balance}</td>
                  <td>{currency.toUpperCase()} {price.toFixed(2)}</td>
                  <td>{currency.toUpperCase()} {totalValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No tokens found.</p>
      )}
    </div>
  );
}
