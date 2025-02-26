import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const ADMIN_WALLET = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113"; // 2% fee adminui

export default function Transactions() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleSendTransaction = async () => {
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

      // Siunčiame pagrindinę transakciją
      const tx1 = await signer.sendTransaction({
        to: recipient,
        value: finalAmount,
      });

      await tx1.wait();

      // Siunčiame 2% fee adminui
      const tx2 = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: feeInWei,
      });

      await tx2.wait();

      alert(`Sėkmingai išsiųsta ${amount} BNB į ${recipient}`);
    } catch (error) {
      console.error("Klaida siunčiant transakciją:", error);
      alert("Klaida siunčiant transakciją. Bandykite dar kartą.");
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
        <h1 className="text-4xl font-bold text-secondary">Send Transactions</h1>
        <p className="text-lg opacity-80 mt-2">Easily send BNB or BSC tokens.</p>
      </div>

      <div className="max-w-3xl mx-auto bg-primary p-6 rounded-lg shadow-dark">
        <h2 className="text-xl font-bold text-secondary mb-4">Enter Details</h2>

        <div className="mt-4">
          <input
            type="text"
            className="w-full p-3 rounded bg-secondary text-background-color"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="number"
            className="w-full p-3 mt-2 rounded bg-secondary text-background-color"
            placeholder="Amount in BNB"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleSendTransaction} className="w-full mt-3 p-3 bg-secondary text-background-color rounded-lg">
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
