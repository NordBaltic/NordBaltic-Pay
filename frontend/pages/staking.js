// 📂 /pages/staking.js - MAX PREMIUM STAKING PAGE
import Staking from "../components/Staking";
import "../styles/globals.css";

export default function StakingPage() {
  return (
    <div className="staking-page">
      <h1>💸 Staking Dashboard</h1>
      <p>Stake your BNB and earn rewards securely with NordBaltic Pay.</p>
      <Staking />
    </div>
  );
