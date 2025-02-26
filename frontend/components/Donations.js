import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import QRCode from "qrcode.react";
import "../styles/globals.css";

export default function Donations() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationFee, setDonationFee] = useState("3%");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [totalDonated, setTotalDonated] = useState("0.00");
  const [loading, setLoading] = useState(true);

  const donationWallet = process.env.NEXT_PUBLIC_DONATION_WALLET;
  const donationContract = process.env.NEXT_PUBLIC_DONATION_CONTRACT_ADDRESS;

  const charityFunds = [
    { name: "🌍 Climate Action Fund", wallet: "0xCharityFund1" },
    { name: "🩺 Medical Relief Fund", wallet: "0xCharityFund2" },
    { name: "📚 Education & Children Fund", wallet: "0xCharityFund3" },
  ];

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchTotalDonations();
    }
  }, [account]);

  const fetchTotalDonations = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_DONATION_STATS_API}`);
      setTotalDonated(response.data.total);
    } catch (error) {
      console.error("❌ Klaida gaunant donacijų statistiką:", error);
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`);
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!donationAmount) return;
    const convert = async () => {
      const rate = await fetchConversionRate();
      if (rate) {
        setConvertedAmount((parseFloat(donationAmount) * rate).toFixed(2));
      }
    };
    convert();
  }, [donationAmount, currency]);

  const handleDonate = async () => {
    if (!donationAmount) return;

    try {
      const sendAmount = web3.utils.toWei(donationAmount, "ether");
      const fee = web3.utils.toWei((parseFloat(donationAmount) * 0.03).toFixed(4), "ether"); // 3% fee
      const netAmount = sendAmount - fee;

      await web3.eth.sendTransaction({
        from: account,
        to: donationContract,
        value: netAmount,
        gas: 21000,
      });

      await web3.eth.sendTransaction({
        from: account,
        to: donationWallet,
        value: fee,
        gas: 21000,
      });

      fetchTotalDonations();
    } catch (error) {
      console.error("❌ Klaida donacijų procese:", error);
    }
  };

  return (
    <div className="donations-container">
      <h2>❤️ Donations</h2>
      <p>Support global charities with NordBaltic Pay. All transactions are transparent and secure.</p>

      <div className="total-donated">
        <h3>🌟 Total Donated: {totalDonated} BNB</h3>
      </div>

      <label>Amount to Donate (BNB)</label>
      <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Enter amount" />

      <label>Show in:</label>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="EUR">💶 EUR</option>
        <option value="USD">💵 USD</option>
      </select>

      {convertedAmount && <p className="converted-amount">≈ {convertedAmount} {currency}</p>}

      <p className="donation-fee">📌 Donation Fee: {donationFee} (Sent directly to charity wallets)</p>

      <button className="donate-btn" onClick={handleDonate}>❤️ Donate Now</button>

      <h3>📜 Donation Transparency</h3>
      <p>All donations are automatically distributed among the following verified funds:</p>
      <ul>
        {charityFunds.map((fund) => (
          <li key={fund.wallet}>
            {fund.name} - <strong>{fund.wallet}</strong> <QRCode value={fund.wallet} size={50} />
          </li>
        ))}
      </ul>
    </div>
  );
}
