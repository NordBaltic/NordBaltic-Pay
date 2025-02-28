import Loading from '../components/Loading';

export default function Home() {
  return (
    <div className="container">
      {/* === LOADING ANIMATION TEST === */}
      <h1 className="gold-text">NordBaltic Pay ULTRA PREMIUM UI</h1>
      <Loading />

      {/* === TESTINĖ LENTELĖ === */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Deposit BTC</td>
              <td>+0.005 BTC</td>
              <td className="status completed">✅ Completed</td>
            </tr>
            <tr>
              <td>Withdraw USDT</td>
              <td>-100 USDT</td>
              <td className="status pending">⏳ Pending</td>
            </tr>
            <tr>
              <td>Stake ETH</td>
              <td>+1.2 ETH</td>
              <td className="status active">🔥 Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
