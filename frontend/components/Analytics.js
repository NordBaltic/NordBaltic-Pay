import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import Chart from "chart.js/auto";
import { Line, Pie } from "react-chartjs-2";

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({});
  const [feesCollected, setFeesCollected] = useState("0.00");
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });

  useEffect(() => {
    fetchTransactionData();
    fetchBalanceData();
    fetchUserStatistics();
  }, []);

  const fetchTransactionData = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS}&apikey=${apiKey}`;
      const response = await axios.get(url);

      if (response.data.status === "1") {
        setTransactions(response.data.result.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBalanceData = async () => {
    try {
      const web3 = new Web3(process.env.NEXT_PUBLIC_BSC_RPC_URL);
      const adminBalance = await web3.eth.getBalance(process.env.NEXT_PUBLIC_ADMIN_WALLET);
      const stakeBalance = await web3.eth.getBalance(process.env.NEXT_PUBLIC_STAKE_WALLET);
      const donationBalance = await web3.eth.getBalance(process.env.NEXT_PUBLIC_DONATION_WALLET);

      setBalances({
        admin: web3.utils.fromWei(adminBalance, "ether"),
        stake: web3.utils.fromWei(stakeBalance, "ether"),
        donation: web3.utils.fromWei(donationBalance, "ether"),
      });

      // Skaičiuojame surinktus mokesčius
      const totalFees = parseFloat(balances.admin) + parseFloat(balances.stake) + parseFloat(balances.donation);
      setFeesCollected(totalFees.toFixed(4));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      // **Imituojame vartotojų duomenų užklausą**
      setUserStats({
        totalUsers: 1200, // Realiame pasaulyje tai būtų gauta iš duomenų bazės
        activeUsers: 870,  // Pvz., per pastarąsias 24h
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  return (
    <div className="analytics-container">
      <h1>📊 System Analytics</h1>

      {/* 🔹 Balansų suvestinė */}
      <div className="balance-summary">
        <h2>💰 Balances</h2>
        <p>Admin Wallet: {balances.admin} BNB</p>
        <p>Stake Wallet: {balances.stake} BNB</p>
        <p>Donation Wallet: {balances.donation} BNB</p>
        <h3>Total Fees Collected: {feesCollected} BNB</h3>
      </div>

      {/* 🔹 Transakcijų istorija */}
      <div className="transaction-history">
        <h2>🔄 Recent Transactions</h2>
        <ul>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <li key={tx.hash}>
                <strong>Tx Hash:</strong> {tx.hash.substring(0, 10)}...
                <a href={`https://bscscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                  🔍 View on BSCScan
                </a>
                <br />
                <strong>From:</strong> {tx.from.substring(0, 6)}...{tx.from.slice(-4)}
                <br />
                <strong>To:</strong> {tx.to.substring(0, 6)}...{tx.to.slice(-4)}
                <br />
                <strong>Value:</strong> {parseFloat(tx.value) / 10 ** 18} BNB
              </li>
            ))
          ) : (
            <p>No transactions found.</p>
          )}
        </ul>
      </div>

      {/* 🔹 Naudotojų statistika */}
      <div className="user-stats">
        <h2>👥 User Activity</h2>
        <p>Total Users: {userStats.totalUsers}</p>
        <p>Active Users (24h): {userStats.activeUsers}</p>

        {/* 🔹 Grafinis atvaizdavimas */}
        <div className="charts">
          <div className="chart">
            <h3>Active Users %</h3>
            <Pie
              data={{
                labels: ["Active Users", "Inactive Users"],
                datasets: [
                  {
                    data: [userStats.activeUsers, userStats.totalUsers - userStats.activeUsers],
                    backgroundColor: ["#4CAF50", "#FF5733"],
                  },
                ],
              }}
            />
          </div>

          <div className="chart">
            <h3>Balance Overview</h3>
            <Line
              data={{
                labels: ["Admin", "Stake", "Donation"],
                datasets: [
                  {
                    label: "BNB Balance",
                    data: [balances.admin, balances.stake, balances.donation],
                    backgroundColor: ["#FFD700"],
                    borderColor: ["#FFD700"],
                    fill: false,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
