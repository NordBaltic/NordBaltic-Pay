import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function Footer() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const netId = await web3Instance.eth.net.getId();
          setNetwork(netId === 56 ? "BSC Mainnet" : "Unsupported Network");

          const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
          setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));
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

      const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
      setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));
    } catch (error) {
      console.error("Error connecting with WalletConnect", error);
    }
  };

  return (
    <footer className="footer">
      <p>© 2025 NordBaltic Pay. All rights reserved.</p>
      <div className="footer-wallet">
        {account ? (
          <div>
            <p>✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
            <p>💰 Balance: {balance} BNB</p>
            <p>🌐 Network: {network}</p>
          </div>
        ) : (
          <div className="wallet-buttons">
            <button className="wallet-connect-btn" onClick={connectWalletConnect}>
              Connect WalletConnect
            </button>
            <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
              Connect MetaMask
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
