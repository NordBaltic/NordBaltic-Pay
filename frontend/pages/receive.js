// 📂 /pages/receive.js - MAX PREMIUM RECEIVE PAGE
import Receive from "../components/Receive";
import "../styles/globals.css";

export default function ReceivePage() {
  return (
    <div className="receive-page">
      <h1>📥 Receive Dashboard</h1>
      <p>Generate your wallet address and receive crypto securely.</p>
      <Receive />
    </div>
  );
}
