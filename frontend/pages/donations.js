import { useState } from "react";
import { ethers } from "ethers";
import QRCode from "qrcode.react";
import { motion } from "framer-motion";

const ADMIN_WALLET = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113"; // Admin mokesčių piniginė

// Labdaros fondai
const charities = [
  {
    name: "Red Cross",
    address: "0xRedCrossWalletAddress",
    logo: "/images/redcross.png",
    description: "Providing emergency assistance, disaster relief, and education."
  },
  {
    name: "Save The Children",
    address: "0xSaveChildrenWalletAddress",
    logo: "/images/savethechildren.png",
    description: "Improving children's lives worldwide through education and healthcare."
  },
  {
    name: "UNICEF",
    address: "0xUnicefWalletAddress",
    logo: "/images/unicef.png",
    description: "Helping children worldwide with nutrition, education, and emergency aid."
  }
];

export default function Donations() {
  const [selectedCharity, setSelectedCharity] = useState(charities[0]);
  const [amount, setAmount] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedCharity.address);
    alert("Charity wallet address copied!");
  };

  const handleDonate = async () => {
    if (!window.ethereum) {
      alert("Please connect your wallet!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const amountInWei = ethers.utils.parseEther(amount);
      const feeInWei = amountInWei.mul(3).div(100); // 3% admin fee
      const finalAmount = amountInWei.sub(feeInWei);

      // Siunčiame auką be 3% fee
      const tx1 = await signer.sendTransaction({
        to: selectedCharity.address,
        value: finalAmount,
      });

      await tx1.wait();

      // 3% fee siunčiame į admin wallet
      const tx2 = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: feeInWei,
      });

      await tx2.wait();

      alert(`Aukojimas sėkmingas: ${amount} BNB į ${selectedCharity.name}`);
    } catch (error) {
      console.error("Klaida aukojant:", error);
      alert("Klaida. Bandykite dar kartą.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background-color text-white p-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">Donate to Charity</h1>
        <p className="text-lg opacity-80 mt-2">Support global causes with crypto donations.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-primary p-6 rounded-lg shadow-dark">
        <h2 className="text-xl font-bold text-secondary mb-4">Select Charity</h2>

        <div className="flex space-x-4 mb-6">
          {charities.map((charity, index) => (
            <button
              key={index}
              className={`p-3 rounded-lg ${selectedCharity.name === charity.name ? "bg-secondary" : "bg-gray-700"}`}
              onClick={() => setSelectedCharity(charity)}
            >
              <img src={charity.logo} alt={charity.name} className="h-10 w-10 mx-auto" />
            </button>
          ))}
        </div>

        <h3 className="text-lg text-white">{selectedCharity.description}</h3>

        <QRCode value={selectedCharity.address} size={200} className="mx-auto my-4" />

        <p className="break-all text-lg bg-secondary p-3 rounded">{selectedCharity.address}</p>
        <button onClick={copyToClipboard} className="mt-3 p-3 bg-secondary text-background-color rounded-lg w-full">
          Copy Address
        </button>

        <div className="mt-4">
          <input
            type="number"
            className="w-full p-3 rounded bg-secondary text-background-color"
            placeholder="Enter amount to donate"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleDonate} className="w-full mt-3 p-3 bg-secondary text-background-color rounded-lg">
            Donate
          </button>
        </div>
      </div>
    </motion.div>
  );
}
