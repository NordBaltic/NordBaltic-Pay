// 📂 /pages/admin.js - Atnaujinta Admin Panelė su `.env` kintamaisiais!
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import AdminContractABI from "../contracts/AdminContractABI.json";
import "../styles/globals.css";

// 🔥 `.env` kintamieji 🔥
const ADMIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS;
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const STAKE_WALLET = process.env.NEXT_PUBLIC_STAKE_WALLET;
const DONATION_WALLET = process.env.NEXT_PUBLIC_DONATION_WALLET;

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [adminContract, setAdminContract] = useState(null);
  const [swapFee, setSwapFee] = useState(0.2);
  const [sendFee, setSendFee] = useState(3);
  const [stakeFee, setStakeFee] = useState({ deposit: 4, withdraw: 4 });
  const [donationFee, setDonationFee] = useState(3);

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contract = new web3Instance.eth.Contract(AdminContractABI, ADMIN_CONTRACT_ADDRESS);
      setAdminContract(contract);
    }
  }, [account]);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
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
    } catch (error) {
      console.error("WalletConnect klaida:", error);
    }
  };

  const updateContract = async (method, value) => {
    if (!adminContract) return alert("Admin kontraktas neprisijungęs!");

    try {
      await adminContract.methods[method](value).send({ from: account });
      alert(`✅ ${method} atnaujintas į ${value}`);
    } catch (error) {
      console.error("Atnaujinimo klaida:", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            🔗 Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={connectMetaMask}>
            🦊 Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          <p>✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>

          <div className="admin-settings">
            <label>Swap Fee (%):</label>
            <input type="number" value={swapFee} onChange={(e) => setSwapFee(e.target.value)} />
            <button onClick={() => updateContract("setSwapFee", swapFee)}>Update</button>

            <label>Send Fee (%):</label>
            <input type="number" value={sendFee} onChange={(e) => setSendFee(e.target.value)} />
            <button onClick={() => updateContract("setSendFee", sendFee)}>Update</button>

            <label>Staking Fee (Deposit/Withdraw %):</label>
            <input type="number" value={stakeFee.deposit} onChange={(e) => setStakeFee({ ...stakeFee, deposit: e.target.value })} />
            <input type="number" value={stakeFee.withdraw} onChange={(e) => setStakeFee({ ...stakeFee, withdraw: e.target.value })} />
            <button onClick={() => updateContract("setStakeFees", [stakeFee.deposit, stakeFee.withdraw])}>Update</button>

            <label>Donation Fee (%):</label>
            <input type="number" value={donationFee} onChange={(e) => setDonationFee(e.target.value)} />
            <button onClick={() => updateContract("setDonationFee", donationFee)}>Update</button>

            <label>Stake Wallet:</label>
            <input type="text" value={STAKE_WALLET} readOnly />
            <button onClick={() => updateContract("setStakeWallet", STAKE_WALLET)}>Update</button>

            <label>Admin Wallet:</label>
            <input type="text" value={ADMIN_WALLET} readOnly />
            <button onClick={() => updateContract("setAdminWallet", ADMIN_WALLET)}>Update</button>

            <label>Donation Wallet:</label>
            <input type="text" value={DONATION_WALLET} readOnly />
            <button onClick={() => updateContract("setDonationWallet", DONATION_WALLET)}>Update</button>
          </div>
        </>
      )}
    </div>
  );
}
