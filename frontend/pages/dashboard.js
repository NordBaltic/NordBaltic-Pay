// 📂 /frontend/pages/dashboard.js
// ✅ DASHBOARD – pagrindinė vartotojo paskyros apžvalga
// ✅ Rodo balansą, stakingą, transakcijas ir turimus tokenus

import { useEffect, useState } from "react";
import Web3 from "web3";
import TokenList from "../components/TokenList";
import TransactionHistory from "../components/TransactionHistory";
import Staking from "../components/Staking";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));
      }
    };

    loadWeb3();
  }, []);

  return (
    <div className="container">
      <Navbar account={account} onDisconnect={() => setAccount(null)} />
      <h1 className="title">Dashboard</h1>

      <div className="dashboard-info">
        <p>Wallet Address: {account ? account : "Not connected"}</p>
        <p>Balance: {balance} BNB</p>
      </div>

      {/* Tokenai, transakcijos ir staking */}
      <TokenList account={account} />
      <TransactionHistory account={account} />
      <Staking account={account} />

      <Footer />
    </div>
  );
}
