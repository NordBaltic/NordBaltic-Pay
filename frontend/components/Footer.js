// 📂 /frontend/components/Footer.js - MAX PREMIUM FOOTER
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";

export default function Footer() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [usdBalance, setUsdBalance] = useState("0.00");
  const [eurBalance, setEurBalance] = useState("0.00");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, account);
    }
  }, [account]);

  const detectNetwork = async (web3Instance) => {
    const netId = await web3Instance.eth.net.getId();
    const netName = netId === 56 ? "🌍 BSC Mainnet" : "🚨 Unsupported Network";
    setNetwork(netName);
  };

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBalance(parseFloat(balanceEth).toFixed(4));
      fetchExchangeRates(balanceEth);
    } catch (error) {
      console.error("Klaida gaunant balansą:", error);
    }
  };

  const fetchExchangeRates = async (bnbAmount) => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur");
      const rates = response.data.binancecoin;
      setUsdBalance((bnbAmount * rates.usd).toFixed(2));
      setEurBalance((bnbAmount * rates.eur).toFixed(2));
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        localStorage.setItem("walletAccount", accounts[0]);
        detectNetwork(web3Instance);
        fetchBalance(web3Instance, accounts[0]);
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
      localStorage.setItem("walletAccount", accounts[0]);
      detectNetwork(web3Instance);
      fetchBalance(web3Instance, accounts[0]);
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetwork("");
    setBalance("0.00");
    setUsdBalance("0.00");
    setEurBalance("0.00");
    localStorage.removeItem("walletAccount");
  };

  return (
    <footer className="footer">
      <p>© 2025 NordBaltic Pay. All rights reserved.</p>
      <div className="footer-wallet">
        {account ? (
          <div className="wallet-info">
            <p>✅ {account.substring(0, 6)}...{account.slice(-4)}</p>
            <p>🌍 {network}</p>
            <p>💰 {balance} BNB</p>
            <p>💵 USD: ${usdBalance} | 💶 EUR: €{eurBalance}</p>
            <QRCode value={account} size={60} />
            <button className="wallet-disconnect-btn" onClick={disconnectWallet}>
              ❌ Disconnect
            </button>
          </div>
        ) : (
          <div className="wallet-buttons">
            <button className="wallet-connect-btn" onClick={connectWalletConnect}>
              🔗 WalletConnect
            </button>
            <button className="wallet-connect-btn" onClick={connectMetaMask}>
              🦊 MetaMask
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
