// 📂 /components/Charts.js - MAX PREMIUM BALANCE CHART
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";

export default function Charts({ account, currency }) {
  const [timeframe, setTimeframe] = useState("24h");
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    if (!account) return;
    fetchBalanceHistory();
    fetchExchangeRate();
  }, [account, timeframe, currency]);

  const fetchBalanceHistory = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
      const url = `https://api.bscscan.com/api?module=account&action=balancehistory&address=${account}&apikey=${apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status === "1") {
        const history = response.data.result;
        const formattedData = history.map((entry) => ({
          time: new Date(entry.timestamp * 1000).toLocaleDateString(),
          balance: parseFloat(entry.balance) / 10 ** 18, // Konvertuoja iš wei į BNB
        }));

        setChartData({
          labels: formattedData.map((entry) => entry.time),
          datasets: [
            {
              label: `Balance (${currency})`,
              data: formattedData.map((entry) => entry.balance * exchangeRate),
              borderColor: "rgba(0, 123, 255, 1)",
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              tension: 0.4,
            },
          ],
        });

        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching balance history:", error);
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency.toLowerCase()}`);
      setExchangeRate(response.data.binancecoin[currency.toLowerCase()]);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  return (
    <div className="chart-container">
      <h3>📈 Balance Change</h3>
      <div className="timeframe-buttons">
        <button onClick={() => setTimeframe("24h")}>24H</button>
        <button onClick={() => setTimeframe("1w")}>1W</button>
        <button onClick={() => setTimeframe("1m")}>1M</button>
      </div>
      {loading ? <p>Loading chart...</p> : <Line data={chartData} />}
    </div>
  );
      }
