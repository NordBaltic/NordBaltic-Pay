export default function Home() {
  return (
    <div className="login-container">
      <h1 className="gold-text fade-in">Welcome to NordBaltic Pay</h1>
      <div className="login-box glass-morph">
        <h2 className="subheading">Sign in to your wallet</h2>

        <button className="wallet-button neon-glow">
          <img src="/icons/walletconnect.svg" className="button-icon" alt="WalletConnect" />
          Connect with WalletConnect
        </button>

        <button className="email-button neon-glow">
          <img src="/icons/email.svg" className="button-icon" alt="Email Login" />
          Login with Email
        </button>

        <div className="login-footer">
          <p className="info-text">Secure & Encrypted. Your keys, your crypto.</p>
        </div>
      </div>
    </div>
  );
}
