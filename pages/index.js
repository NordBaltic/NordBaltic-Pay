export default function Home() {
  return (
    <div className="login-container fade-in-scale">
      {/* 🔥 Prabangus NORD BALTIC PAY titulas */}
      <h1 className="nordbaltic-title glow-text">
        NORD<b>BALTIC PAY</b>
      </h1>

      {/* 🔥 Login box su Glassmorphism efektu */}
      <div className="login-box glass-morph">
        <h2 className="subheading fade-in">Sign in to your wallet</h2>

        {/* 🔥 WalletConnect mygtukas */}
        <button className="wallet-button neon-glow">
          <img src="/icons/walletconnect.svg" className="button-icon" alt="WalletConnect" />
          <span>Connect with WalletConnect</span>
        </button>

        {/* 🔥 Email login mygtukas */}
        <button className="email-button neon-glow">
          <img src="/icons/email.svg" className="button-icon" alt="Email Login" />
          <span>Login with Email</span>
        </button>

        {/* 🔒 Secure info tekstas */}
        <div className="login-footer fade-in">
          <p className="info-text">🔒 Secure and Encrypted</p>
        </div>
      </div>
    </div>
  );
}
