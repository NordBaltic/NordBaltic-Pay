import Charts from "../components/Charts";
import "../styles/globals.css";

const ChartsPage = () => {
  return (
    <div className="charts-page">
      <h1>📊 Market Data</h1>
      <p>📈 Live BNB price changes based on market data.</p>
      <Charts />
    </div>
  );
};

export default ChartsPage;
