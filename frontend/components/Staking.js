import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import QRCode from "qrcode.react";
import "../styles/globals.css";

export default function Staking() {
  const [account, setAccount] = useState(localStorage.getItem("walletAccount") || null);
  const [web3, setWeb3] = useState(null);
  const [stakedBalance, setStakedBalance] = useState("0.00");
  const [rewards, setRewards] = useState("0.00");
  const [apy, setApy] = useState("0.00%");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  const stakeWallet = process.env.NEXT_PUBLIC_STAKE_WALLET;
  const stakingContract = process.env.NEXT_PUBLIC_STAKE_CONTRACT_ADDRESS;

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      fetchStakingData();
      fetchApy();
    }
  }, [account]);

  const fetchStakingData = async () => {
    try {
      const balanceWei = await web3.eth.getBalance(account);
      const balanceEth = web3.utils.fromWei(balanceWei, "ether");
      setStakedBalance(parseFloat(balanceEth).toFixed(4));

      // Simuliuojamas reward'ų skaičiavimas
      setRewards((parseFloat(balanceEth) * 0.1).toFixed(4)); // 10% metiniai reward'ai
    } catch (error) {
      console.error("❌ Klaida gaunant staking duomenis:", error);
    }
  };

  const fetchApy = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_STAKING_PROVIDER_URL}/apy`);
      setApy(`${response.data.apy}%`);
    } catch (error) {
      console.error("❌ Klaida gaunant APY:", error);
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
    if (!amount) return;
    const convert = async () => {
      const rate = await fetchConversionRate();
      if (rate) {
        setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
      }
    };
    convert();
  }, [amount, currency]);

  const handleStake = async () => {
    if (!amount) return;

    try {
      const sendAmount = web3.utils.toWei(amount, "ether");
      const fee = web3.utils.toWei((parseFloat(amount) * 0.04).toFixed(4), "ether"); // 4% fee

      await web3.eth.sendTransaction({
        from: account,
        to: stakingContract,
        value: sendAmount - fee,
        gas: 21000,
      });

      await web3.eth.sendTransaction({
        from: account,
        to: stakeWallet,
        value: fee,
        gas: 21000,
      });

      fetchStakingData();
    } catch (error) {
      console.error("❌ Klaida staking procese:", error);
    }
  };

  const handleUnstake = async () => {
    try {
      const balanceWei = await web3.eth.getBalance(account);
      const balanceEth = web3.utils.fromWei(balanceWei, "ether");
      const sendAmount = web3.utils.toWei(balanceEth, "ether");
      const fee = web3.utils.toWei((parseFloat(balanceEth) * 0.04).toFixed(4), "ether"); // 4% fee

      await web3.eth.sendTransaction({
        from: account,
        to: account, // Čia bus unstake funkcija, simuliuojama
        value: sendAmount - fee,
        gas: 21000,
      });

      await web3.eth.sendTransaction({
        from: account,
        to: stakeWallet,
        value: fee,
        gas: 21000,
      });

      fetchStakingData();
    } catch (error) {
      console.error("❌ Klaida unstake procese:", error);
    }
  };

  return (
    <div className="staking-container">
      <h2>💸 Staking</h2>
      <p>Stake your BNB and earn passive income! Current APY: <strong>{apy}</strong></p>

      <div className="balance-info">
        <p>💰 Staked Balance: {stakedBalance} BNB</p>
        <p>🏆 Earned Rewards: {rewards} BNB</p>
      </div>

      <label>Amount to Stake (BNB)</label>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />

      <label>Show in:</label>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="EUR">💶 EUR</option>
        <option value="USD">💵 USD</option>
      </select>

      {convertedAmount && <p className="converted-amount">≈ {convertedAmount} {currency}</p>}

      <button className="stake-btn" onClick={handleStake}>🚀 Stake</button>
      <button className="unstake-btn" onClick={handleUnstake}>🔄 Unstake</button>
    </div>
  );
      }
