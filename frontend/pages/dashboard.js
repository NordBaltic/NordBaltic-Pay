import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import QRCode from "qrcode.react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";

const Charts = dynamic(() => import("../components/Charts"), { ssr: false });

export default function Dashboard() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [convertedBalance, setConvertedBalance] = useState("0.00");
  const [currency, setCurrency] = useState(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "EUR");
  const [stakingStatus, setStakingStatus] = useState("Not Staked");
  const [donationTotal, setDonationTotal] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchBalance(web3Instance, account);
      fetchStakingStatus(account);
      fetchDonationStatus();
    }
  }, [account]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));

      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      setConvertedBalance((parseFloat(balanceEth) * response.data.binancecoin[currency.toLowerCase()]).toFixed(2));
      
      setIsLoading(false);
    } catch (error) {
      console.error("Klaida gaunant balansą:", error);
    }
  };

  const fetchStakingStatus = async (account) => {
    try {
      const stakingContract = new web3.eth.Contract([
        { name: "getStakeInfo", type: "function", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] }
      ], process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS);
      
      const stakedAmount = await stakingContract.methods.getStakeInfo(account).call();
      setStakingStatus(`${web3.utils.fromWei(stakedAmount, "ether")} BNB Staked`);
    } catch (error) {
      console.error("Klaida gaunant staking informaciją:", error);
    }
  };

  const fetchDonationStatus = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DONATION_API_URL}`);
      setDonationTotal(response.data.totalDonated);
    } catch (error) {
      console.error("Klaida gaunant donation informaciją:", error);
    }
  };

  const connectWallet = async (walletType) => {
    let provider;
    if (walletType === "MetaMask" && window.ethereum) {
      provider = window.ethereum;
    } else if (walletType === "WalletConnect") {
      provider = new WalletConnectProvider({ rpc: { 56: process.env.NEXT_PUBLIC_BSC_RPC_URL } });
      await provider.enable();
    } else if (walletType === "Coinbase") {
      const coinbaseWallet = new CoinbaseWalletSDK({ appName: "NordBaltic Pay" });
      provider = coinbaseWallet.makeWeb3Provider(process.env.NEXT_PUBLIC_BSC_RPC_URL, 56);
    }

    if (provider) {
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      localStorage.setItem("walletAccount", accounts[0]);
      fetchBalance(web3Instance, accounts[0]);
    } else {
      alert("Wallet not found!");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🏠 Dashboard</h1>
      
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={() => connectWallet("MetaMask")}>🦊 Connect MetaMask</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("WalletConnect")}>🔗 Connect WalletConnect</button>
          <button className="wallet-connect-btn" onClick={() => connectWallet("Coinbase")}>🏦 Connect Coinbase Wallet</button>
        </div>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="balance-text">💰 Balance: {bnbBalance} BNB (~{convertedBalance} {currency})</p>

          <div className="actions">
            <Link href="/send"><button className="action-btn">📤 Send</button></Link>
            <Link href="/receive"><button className="action-btn">📥 Receive</button></Link>
            <Link href="/staking"><button className="action-btn">💸 Stake</button></Link>
            <Link href="/donations"><button className="action-btn">❤️ Donate</button></Link>
            <Link href="/swap"><button className="action-btn">🔄 Swap</button></Link>
          </div>

          <div className="status-section">
            <p className="staking-status">💰 Staking: {stakingStatus}</p>
            <p className="donation-status">🎗️ Total Donated: {donationTotal} BNB</p>
          </div>

          <Charts account={account} />

          <label>🔄 Show in:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">💶 EUR</option>
            <option value="USD">💵 USD</option>
          </select>
        </>
      )}
    </div>
  );
}
