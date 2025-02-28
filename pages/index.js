export default function Home() {
  return (
    <div className="login-container">
      <h1 className="gold-text">Welcome to NordBaltic Pay</h1>
      <div className="login-box">
        <h2>Sign in to your wallet</h2>

        <button className="wallet-button">
          <img src="/icons/walletconnect.svg" className="button-icon" alt="WalletConnect" />
          Connect with WalletConnect
        </button>

        <button className="email-button">
          <img src="/icons/email.svg" className="button-icon" alt="Email Login" />
          Login with Email
        </button>
      </div>
    </div>
  );
}
