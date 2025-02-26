// 📂 /pages/swap.js - MAX PREMIUM SWAP PAGE
import Swap from "../components/Swap";
import "../styles/globals.css";

export default function SwapPage() {
  return (
    <div className="swap-page">
      <h1>🔄 Swap Dashboard</h1>
      <p>Convert between supported tokens instantly with security and transparency.</p>
      <Swap />
    </div>
  );
}
