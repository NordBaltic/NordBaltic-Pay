import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const DONATION_FUNDS = [
  {
    name: "Save the Children",
    wallet: "0x123456789abcdef123456789abcdef123456789a",
    description: "Supporting children's education, health, and protection globally.",
    image: "/save-the-children.png",
  },
  {
    name: "Red Cross",
    wallet: "0xabcdef123456789abcdef123456789abcdef1234",
    description: "Providing emergency assistance, disaster relief, and education.",
    image: "/red-cross.png",
  },
  {
    name: "UNICEF",
    wallet: "0x789abcdef123456789abcdef123456789abcdef12",
    description: "Helping children worldwide with healthcare, food, and education.",
    image: "/unicef.png",
  },
];

const ADMIN_WALLET = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113"; // Admin 2% fee

export default function Donations() {
  const [selectedFund, setSelectedFund] = useState(DONATION_FUNDS[0]);
  const [amount, setAmount] = useState("");

  const handleDonation = async () => {
    if (!window.ethereum) {
      alert("Please connect your wallet!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const amountInWei = ethers.utils.parseEther(amount);
      const feeInWei = amountInWei.mul(2).div(100); // 2% fee
      const finalAmount = amountInWei.sub(feeInWei);

      // Siunčiame auką į pasirinktą fondą
      const tx1 = await signer.sendTransaction({
        to: selectedFund.wallet,
        value: finalAmount,
      });

      await tx1.wait();

      // Siunčiame 2% fee į admin wallet
      const tx2 = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: feeInWei,
      });

      await tx2.wait();

      alert(`Ačiū! Paaukojote ${amount} BNB fondui ${selectedFund.name}`);
    } catch (error) {
      console.error("Donation error:", error);
      alert("Klaida siunčiant auką. Bandykite dar kartą.");
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
        <h1 className="text-4xl font-bold text-secondary">Donate to Charities</h1>
        <p className="text-lg opacity-80 mt-2">Make a difference by donating crypto to global charities.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-primary p-6 rounded-lg shadow-dark">
        <h2 className="text-xl font-bold text-secondary mb-4">Select Charity</h2>

        <div className="flex space-x-4 overflow-x-auto py-3">
          {DONATION_FUNDS.map((fund) => (
            <motion.div
              key={fund.wallet}
              className={`p-4 rounded-lg cursor-pointer transition ${
                selectedFund.wallet === fund.wallet ? "bg-secondary" : "bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedFund(fund)}
            >
              <img src={fund.image} alt={fund.name} className="h-16 mx-auto mb-2" />
              <p className="text-center text-white">{fund.name}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-4 opacity-80">{selectedFund.description}</p>

        <div className="mt-6">
          <input
            type="number"
            className="w-full p-3 rounded bg-secondary text-background-color"
            placeholder="Enter amount in BNB"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleDonation} className="w-full mt-3 p-3 bg-secondary text-background-color rounded-lg">
            Donate Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
