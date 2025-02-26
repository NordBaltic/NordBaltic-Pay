import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";
import axios from "axios";
import Loader from "./Loader"; // 🔥 Krovimosi efektas
import "../styles/globals.css";

export default function Send() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [bnbBalance, setBnbBalance] = useState("0.00");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 SMART CONTRACT ADRESAS 🔹
  const smartContractAddress = "YOUR_SMART_CONTRACT_ADDRESS";

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("walletAccount", accounts[0]);
          fetchBalance(web3Instance, accounts[0]);
        }
      }
      setIsLoading(false);
    };
    loadWeb3();
  }, []);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balanceWei = await web3Instance.eth.getBalance(account);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
      setBnbBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Klaida gaunant balansą:", error);
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!amount) return;
    const convert = async () => {
      const rate = await fetchConversionRate();
      if (rate) {
        setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
      }
    };
    convert();
  }, [amount, currency]);

  useEffect(() => {
    if (!recipient) return;
    setIsValidAddress(Web3.utils.isAddress(recipient));
  }, [recipient]);

  const handleSend = async () => {
    if (!recipient || !amount) {
      setStatus("❌ Please enter recipient and amount.");
      return;
    }
    if (!isValidAddress) {
      setStatus("❌ Invalid recipient address.");
      return;
    }

    try {
      setStatus("⏳ Processing transaction...");
      setIsLoading(true);
      const sendAmount = web3.utils.toWei(amount, "ether");

      // 🔹 Vietoj to, kad siųstume tiesiai gavėjui, siunčiame į smart contract 🔹
      const transaction = await web3.eth.sendTransaction({
        from: account,
        to: smartContractAddress,
        value: sendAmount,
        gas: 21000,
      });

      setStatus(`✅ Transaction Successful! TX Hash: ${transaction.transactionHash}`);
      fetchBalance(web3, account);
    } catch (error) {
      console.error("Transaction Failed", error);
      setStatus("❌ Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="send-container">
      {isLoading ? (
        <Loader message="Processing transaction..." />
      ) : !account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            🦊 Connect MetaMask
          </button>
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            🔗 Connect WalletConnect
          </button>
        </div>
      ) : (
        <>
          <p className="wallet-address">✅ Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <p className="balance-text">💰 Balance: {bnbBalance} BNB</p>
          <div className="send-form">
            <label>Recipient Address</label>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className={isValidAddress ? "" : "invalid"} />
            
            {recipient && <QRCode value={recipient} size={128} className="qr-code" />}
            {!isValidAddress && <p className="error-text">❌ Invalid Address</p>}

            <label>Amount (BNB)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.01" />

            <label>Show in:</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="EUR">💶 EUR</option>
              <option value="USD">💵 USD</option>
            </select>

            {convertedAmount && <p className="converted-amount">≈ {convertedAmount} {currency}</p>}

            <button className="send-btn" onClick={handleSend}>🚀 Send</button>
          </div>
          <p className="status-text">{status}</p>
        </>
      )}
    </div>
  );
}
