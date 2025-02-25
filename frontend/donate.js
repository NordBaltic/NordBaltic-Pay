// 📂 /frontend/pages/donate.js - Labdaros integracija su trimis pagrindiniais fondais
import { useState } from 'react';
import { donateToCharity } from '../utils/donate';
import '../styles.css';

const charities = [
  { name: "Global Aid Fund", wallet: "0x1234567890abcdef1234567890abcdef12345678", image: "/charity1.jpg", description: "Providing essential aid worldwide." },
  { name: "Children's Future", wallet: "0xabcdef1234567890abcdef1234567890abcdef12", image: "/charity2.jpg", description: "Helping children in need across the globe." },
  { name: "Green Earth Initiative", wallet: "0x7890abcdef1234567890abcdef1234567890abcd", image: "/charity3.jpg", description: "Fighting for a sustainable future." }
];

export default function Donate() {
  const [amount, setAmount] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(charities[0]);

  return (
    <div className="container">
      <h1 className="title">Donate to Charity</h1>
      <img src={selectedCharity.image} alt={selectedCharity.name} className="charity-img" />
      <p className="charity-desc">{selectedCharity.description}</p>
      <select onChange={(e) => setSelectedCharity(charities[e.target.value])} className="charity-select">
        {charities.map((charity, index) => (
          <option key={index} value={index}>{charity.name}</option>
        ))}
      </select>
      <input type="number" placeholder="Amount in BNB" value={amount} onChange={(e) => setAmount(e.target.value)} className="amount-input" />
      <button className="connect-btn" onClick={() => donateToCharity(selectedCharity.wallet, amount)}>Donate</button>
    </div>
  );
}
