import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { motion } from "framer-motion";

export default function Receive() {
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Wallet address copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background-color text-white p-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">Receive Crypto</h1>
        <p className="text-lg opacity-80 mt-2">Share your wallet address to receive funds.</p>
      </div>

      <div className="max-w-lg mx-auto bg-primary p-6 rounded-lg shadow-dark text-center">
        <h2 className="text-xl font-bold text-secondary mb-4">Your Wallet Address</h2>
        {walletAddress ? (
          <>
            <QRCode value={walletAddress} size={200} className="mx-auto mb-4" />
            <p className="break-all text-lg bg-secondary p-3 rounded">{walletAddress}</p>
            <button onClick={copyToClipboard} className="mt-3 p-3 bg-secondary text-background-color rounded-lg w-full">
              Copy Address
            </button>
          </>
        ) : (
          <p className="text-white">Please connect your wallet.</p>
        )}
      </div>
    </motion.div>
  );
}
