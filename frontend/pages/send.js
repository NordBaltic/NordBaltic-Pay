import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react"; // ✅ QR kodų palaikymas
import "../styles/globals.css";

export default function Send() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.002 BNB");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("EUR"); // ✅ Numatytasis EUR
  const [convertedAmount, setConvertedAmount] = useState(null);

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

  const fetchConversionRate = async () => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      const data = await response.json();
      return data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("Error fetching conversion rate:", error);
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

  const handleSend = async () => {
    if (!recipient || !amount) {
      setStatus("❌ Please enter recipient and amount.");
      return;
    }

    try {
      setStatus("⏳ Processing transaction...");
      const sendAmount = web3.utils.toWei(amount, "ether");
      const transaction = await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: sendAmount,
        gas: 21000,
      });
      setStatus(`✅ Transaction Successful! TX Hash: ${transaction.transactionHash}`);
    } catch (error) {
      console.error("Transaction Failed", error);
      setStatus("❌ Transaction failed. Please try again.");
    }
  };

  return (
    <div className="send-container">
      <h1 className="send-title">Send Crypto</h1>
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
        <>
          <p className="wallet-address">Connected: {account.substring(0, 6)}...{account.slice(-4)}</p>
          <div className="send-form">
            <label>Recipient Address</label>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
            
            {/* ✅ QR kodas adresui */}
            {recipient && <QRCode value={recipient} size={128} className="qr-code" />}

            <label>Amount (BNB)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.01" />

            {/* ✅ Pasirinkimas rodyti sumą EUR/USD */}
            <label>Show in:</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>

            {/* ✅ Konvertuota suma */}
            {convertedAmount && <p className="converted-amount">≈ {convertedAmount} {currency}</p>}

            <p className="fee-text">Estimated Fee: {fee} (~{(parseFloat(fee) * convertedAmount).toFixed(2)} {currency})</p>
            <button className="send-btn" onClick={handleSend}>Send</button>
          </div>
          <p className="status-text">{status}</p>
        </>
      )}
    </div>
  );
}
