// 📂 /frontend/components/Donations.js
// ✅ 3 didžiausi pasauliniai fondai su automatiniais kripto pervedimais
// ✅ 3% platformos tarpininkavimo mokestis automatiškai adminui
// ✅ Kiekvienas fondas turi nuotrauką, aprašymą ir aukojimo mygtuką
// ✅ Slinkamas UI su fondų pasirinkimu

import { useState } from "react";
import Web3 from "web3";

const donationFunds = [
  {
    name: "Save the Children",
    address: "0xFbdA7f3eF8d4cC5BbD87aA97cAC79A1b2C3B1A74",
    image: "/images/save-the-children.jpg",
    description: "Providing food, healthcare, and education to children in need worldwide."
  },
  {
    name: "World Wildlife Fund",
    address: "0xE5aA7E9F9A1D5e20Bd5FeD7a8f42e85e0C4F9b74",
    image: "/images/wwf.jpg",
    description: "Protecting endangered species and preserving natural habitats."
  },
  {
    name: "Red Cross",
    address: "0xB4A92E75aF32Bd16f0F2f9a6c6F1C41e4c0A9eC4",
    image: "/images/red-cross.jpg",
    description: "Humanitarian aid and emergency response worldwide."
  }
];

const adminWallet = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113";

export default function Donations({ account }) {
  const [currentFund, setCurrentFund] = useState(0);
  const [amount, setAmount] = useState("");

  const web3 = new Web3(window.ethereum);

  const donate = async () => {
    if (!account || !amount) return;

    const amountWei = web3.utils.toWei(amount, "ether");
    const fee = web3.utils.toWei((parseFloat(amount) * 0.03).toString(), "ether");
    const fundAddress = donationFunds[currentFund].address;

    try {
      await web3.eth.sendTransaction({
        from: account,
        to: fundAddress,
        value: amountWei
      });

      await web3.eth.sendTransaction({
        from: account,
        to: adminWallet,
        value: fee
      });

      setAmount("");
      alert(`Donation to ${donationFunds[currentFund].name} successful!`);
    } catch (error) {
      console.error("Donation failed", error);
    }
  };

  return (
    <div className="donations-container">
      <h2>🌍 Support a Cause</h2>
      <img src={donationFunds[currentFund].image} alt={donationFunds[currentFund].name} className="donation-image" />
      <h3>{donationFunds[currentFund].name}</h3>
      <p>{donationFunds[currentFund].description}</p>

      <input
        type="number"
        placeholder="Enter amount (BNB)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={donate}>💖 Donate</button>

      <div className="donation-nav">
        <button onClick={() => setCurrentFund((currentFund + 2) % 3)}>⬅️</button>
        <button onClick={() => setCurrentFund((currentFund + 1) % 3)}>➡️</button>
      </div>
    </div>
  );
}
