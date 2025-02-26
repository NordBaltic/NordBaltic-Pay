import { useEffect, useState } from "react";
import axios from "axios";
import Web3 from "web3";
import dynamic from "next/dynamic";
import "../styles/globals.css";

const Chart = dynamic(() => import("../components/Charts"), { ssr: false });

const Analytics = () => {
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [swapVolume, setSwapVolume] = useState(0);
  const [donationVolume, setDonationVolume] = useState(0);
  const [stakingVolume, setStakingVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics");
        setTotalTransactions(response.data.totalTransactions);
        setTotalVolume(response.data.totalVolume);
        setTotalUsers(response.data.totalUsers);
        setSwapVolume(response.data.swapVolume);
        setDonationVolume(response.data.donationVolume);
        setStakingVolume(response.data.stakingVolume);
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="loading">🔄 Loading analytics data...</p>;

  return (
    <div className="analytics-container">
      <h1>📊 Platform Analytics</h1>
      
      <div className="analytics-grid">
        <div className="analytics-box">
          <h2>🔄 Total Transactions</h2>
          <p>{totalTransactions.toLocaleString()}</p>
        </div>

        <div className="analytics-box">
          <h2>💰 Total Volume</h2>
          <p>{totalVolume.toFixed(2)} BNB</p>
        </div>

        <div className="analytics-box">
          <h2>👥 Total Users</h2>
          <p>{totalUsers.toLocaleString()}</p>
        </div>

        <div className="analytics-box">
          <h2>🔄 Swap Volume</h2>
          <p>{swapVolume.toFixed(2)} BNB</p>
        </div>

        <div className="analytics-box">
          <h2>❤️ Donation Volume</h2>
          <p>{donationVolume.toFixed(2)} BNB</p>
        </div>

        <div className="analytics-box">
          <h2>📈 Staking Volume</h2>
          <p>{stakingVolume.toFixed(2)} BNB</p>
        </div>
      </div>

      <Chart 
        totalTransactions={totalTransactions}
        totalVolume={totalVolume}
        swapVolume={swapVolume}
        donationVolume={donationVolume}
        stakingVolume={stakingVolume}
      />
    </div>
  );
};

export default Analytics;
