// 📂 /pages/donations.js - MAX PREMIUM DONATIONS PAGE
import Donations from "../components/Donations";
import "../styles/globals.css";

export default function DonationsPage() {
  return (
    <div className="donations-page">
      <h1>❤️ Donations Dashboard</h1>
      <p>Help make the world a better place with your crypto donations.</p>
      <Donations />
    </div>
  );
}
