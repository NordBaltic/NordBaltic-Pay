export default function Dashboard() {
  return (
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
            <td>✅ Completed</td>
          </tr>
          <tr>
            <td>Withdraw USDT</td>
            <td>-100 USDT</td>
            <td>⏳ Pending</td>
          </tr>
          <tr>
            <td>Stake ETH</td>
            <td>+1.2 ETH</td>
            <td>✅ Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
