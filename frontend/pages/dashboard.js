import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TokenList from "../components/TokenList";
import TransactionHistory from "../components/TransactionHistory";
import WalletConnectButton from "../components/WalletConnectButton";

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background-color text-white p-6"
    >
      {/* Dashboard antraštė */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-secondary">Dashboard</h1>
        <p className="text-lg opacity-80 mt-2">Manage your BSC wallet with ease.</p>
      </motion.div>

      {/* Prisijungimo mygtukas jei neprisijungęs */}
      {!walletAddress && (
        <div className="flex justify-center">
          <WalletConnectButton />
        </div>
      )}

      {/* Dashboard turinys */}
      {walletAddress && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Vartotojo turimi tokenai */}
          <TokenList />

          {/* Transakcijų istorija */}
          <TransactionHistory />
        </motion.div>
      )}

      {/* Apatinė informacija */}
      <motion.div
        className="mt-12 text-center opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p>NordBaltic Pay | Secure & Fast Transactions</p>
      </motion.div>
    </motion.div>
  );
}
