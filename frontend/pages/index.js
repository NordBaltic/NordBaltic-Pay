import { motion } from "framer-motion";
import WalletConnectButton from "../components/WalletConnectButton";
import TokenList from "../components/TokenList";
import TransactionHistory from "../components/TransactionHistory";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background-color text-white flex flex-col items-center justify-center p-6"
    >
      {/* Hero sekcija */}
      <motion.div
        className="text-center mb-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src="/logo.png"
          alt="NordBaltic Pay"
          className="h-24 mx-auto mb-4"
          whileHover={{ scale: 1.1 }}
        />
        <h1 className="text-4xl font-bold text-secondary">NordBaltic Pay</h1>
        <p className="text-lg opacity-80 mt-2">Your Gateway to Secure and Advanced BSC Transactions.</p>
      </motion.div>

      {/* Prisijungimo mygtukas */}
      <WalletConnectButton />

      {/* Pagrindinės funkcijos */}
      <motion.div
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Token sąrašas */}
        <TokenList />
        {/* Transakcijų istorija */}
        <TransactionHistory />
      </motion.div>

      {/* Apatinė informacinė dalis */}
      <motion.div
        className="mt-12 text-center opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p>Powered by Web3 Technology | Secure & Fast BSC Transactions</p>
      </motion.div>
    </motion.div>
  );
}
