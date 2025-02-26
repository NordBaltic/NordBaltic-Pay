import { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const Charts = () => {
  const [chartInstance, setChartInstance] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("24h");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData(selectedInterval);
  }, [selectedInterval]);

  const fetchChartData = async (interval) => {
    try {
      setLoading(true);
      
      // Patikrina ar yra duomenų Supabase DB
      const { data: dbData, error } = await supabase
        .from("bnb_price_history")
        .select("*")
        .eq("interval", interval)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (!error && dbData.length > 0) {
        console.log("🔹 Naudojami duomenys iš Supabase DB");
        setChartData(JSON.parse(dbData[0].data));
        setLoading(false);
        updateChart(JSON.parse(dbData[0].data));
        return;
      }

      // Jei nėra DB duomenų, gaunama iš Coingecko API
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${
          interval === "24h" ? 1 : interval === "7d" ? 7 : 30
        }&interval=daily`
      );

      const prices = response.data.prices.map((data) => ({
        x: new Date(data[0]),
        y: data[1],
      }));

      setChartData(prices);
      setLoading(false);
      updateChart(prices);

      // Įrašo duomenis į Supabase DB
      await supabase.from("bnb_price_history").insert([{ interval, data: JSON.stringify(prices) }]);

    } catch (error) {
      console.error("❌ Error fetching chart data:", error);
      setLoading(false);
    }
  };

  const updateChart = (data) => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById("balanceChart").getContext("2d");
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "BNB Price (USD)",
            data,
            borderColor: "rgba(255, 215, 0, 1)",
            backgroundColor: "rgba(255, 215, 0, 0.15)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(255, 215, 0, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#fff",
              font: { size: 14, weight: "bold" },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "day" },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "#fff" },
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "#fff", callback: (value) => `$${value}` },
          },
        },
        animations: {
          tension: { duration: 1500, easing: "easeInOutBounce", from: 1, to: 0.4 },
        },
      },
    });

    setChartInstance(newChart);
  };

  return (
    <div className="charts-container">
      <h1 className="chart-title">📊 BNB Price Chart</h1>
      <div className="chart-controls">
        {["24h", "7d", "30d"].map((interval) => (
          <button
            key={interval}
            className={`chart-btn ${selectedInterval === interval ? "active" : ""}`}
            onClick={() => setSelectedInterval(interval)}
          >
            {interval.toUpperCase()}
          </button>
        ))}
      </div>
      {loading ? <p className="chart-loading">🔄 Loading chart...</p> : <canvas id="balanceChart"></canvas>}
    </div>
  );
};

export default Charts;
