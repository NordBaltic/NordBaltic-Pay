// 📂 /pages/admin.js - Admin Panelė su Pilnu Valdymu
import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import AdminContractABI from "../contracts/AdminContractABI.json";
import "../styles/globals.css";

export default function Admin() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [adminContract, setAdminContract] = useState(null);
  const [swapFee, setSwapFee] = useState(0.2);
  const [sendFee, setSendFee] = useState(3);
  const [stakeFee, setStakeFee] = useState({ deposit: 4, withdraw: 4 });
  const [donationFee, setDonationFee] = useState(3);
  const [stakeWallet, setStakeWallet] = useState("0x80131a0ec0d5e093964c267aa00d0c6956e064a7");
  const [adminWallet, setAdminWallet] = useState("0xc7acc7c830aa381b6a7e7cf8baa9ddea6e576113");
  const [donationWallet, setDonationWallet] = useState("0xfdb709e2bf745145fd8cd5f9130616a4c7865776");
  const adminContractAddress = "YOUR_ADMIN_CONTRACT_ADDRESS"; // 🔹 Admin kontrakto adresas

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contract = new web3Instance.eth.Contract(AdminContractABI, adminContractAddress);
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
            <input type="text" value={stakeWallet} onChange={(e) => setStakeWallet(e.target.value)} />
            <button onClick={() => updateContract("setStakeWallet", stakeWallet)}>Update</button>

            <label>Admin Wallet:</label>
            <input type="text" value={adminWallet} onChange={(e) => setAdminWallet(e.target.value)} />
            <button onClick={() => updateContract("setAdminWallet", adminWallet)}>Update</button>

            <label>Donation Wallet:</label>
            <input type="text" value={donationWallet} onChange={(e) => setDonationWallet(e.target.value)} />
            <button onClick={() => updateContract("setDonationWallet", donationWallet)}>Update</button>
          </div>
        </>
      )}
    </div>
  );
}
