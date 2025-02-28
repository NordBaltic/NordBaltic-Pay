export default function Home() {
  return (
    <div className="login-container">
      <h1 className="gold-text">Welcome to NordBaltic Pay</h1>
      <div className="login-box">
        <h2>Sign in to your wallet</h2>
        <button className="wallet-button">🔗 Connect with MetaMask</button>
        <button className="wallet-button">🦊 Connect with Trust Wallet</button>
        <button className="wallet-button">📱 Login with Email</button>
        <button className="wallet-button">💳 Use Credit Card</button>
      </div>
    </div>
  );
}
