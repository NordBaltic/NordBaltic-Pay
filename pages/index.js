export default function Home() {
  return (
    <div className="center-container">
      <nav className="navbar">
        <a href="#">Home</a>
        <a href="#">Dashboard</a>
        <a href="#">Settings</a>
      </nav>

      <div className="glass fade-in glowing-border card">
        <h1 className="neon-text gold-text">NordBaltic Pay ULTRA PREMIUM UI</h1>
        <button className="smooth-button">Let's Go</button>
      </div>

      <div className="loader"></div>
    </div>
  );
}
