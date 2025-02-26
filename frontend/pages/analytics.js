import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/globals.css";

export default function AnalyticsPage() {
  const [bnbPrice, setBnbPrice] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [volume, setVolume] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");

  useEffect(() => {
    fetchMarketData();
    fetchChartData(timeframe);
  }, [timeframe]);

  const fetchMarketData = async () => {
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/coins/binancecoin");
      const data = response.data.market_data;
      setBnbPrice(data.current_price.usd);
      setMarketCap(data.market_cap.usd);
      setVolume(data.total_volume.usd);
      setPriceChange(data.price_change_percentage_24h);
    } catch (error) {
      console.error("🔴 Error fetching market data:", error);
    }
  };

  const fetchChartData = async (selectedTimeframe) => {
    const days = selectedTimeframe === "1d" ? 1 : selectedTimeframe === "7d" ? 7 : 30;
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${days}`);
      const prices = response.data.prices;
      setChartData({
        labels: prices.map((entry) => new Date(entry[0]).toLocaleDateString()),
        datasets: [
          {
            label: "BNB Price",
            data: prices.map((entry) => entry[1]),
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("🔴 Error fetching chart data:", error);
    }
  };

  return (
    <div className="analytics-container">
      <h1>📊 Crypto Analytics</h1>
      <p>📉 Track real-time BNB market data, trends, and performance.</p>

      {/* 🔹 Market Data */}
      <div className="market-info">
        <p>💰 BNB Price: <strong>${bnbPrice?.toFixed(2)}</strong></p>
        <p>📈 Market Cap: <strong>${marketCap?.toLocaleString()}</strong></p>
        <p>🔄 24h Volume: <strong>${volume?.toLocaleString()}</strong></p>
        <p>📊 24h Change: <span className={priceChange > 0 ? "positive" : "negative"}>{priceChange?.toFixed(2)}%</span></p>
      </div>

      {/* 🔹 Price Chart */}
      <h3>📊 Price Chart</h3>
      <select onChange={(e) => setTimeframe(e.target.value)}>
        <option value="1d">Last 24h</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
      {chartData && <Line data={chartData} />}

      {/* 🔹 Navigation */}
      <div className="navigation">
        <a href="/dashboard" className="nav-btn">🏠 Dashboard</a>
        <a href="/transactions" className="nav-btn">📜 Transactions</a>
      </div>
    </div>
  );
        }
