import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

export default function WalletConnectButton() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID, // Infura ID reikalingas WalletConnect
            },
          },
        },
      });

      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setProvider(web3Provider);
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("Prisijungimo klaida:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setProvider(null);
    localStorage.removeItem("walletAddress");
  };

  return (
    <motion.div
      className="flex items-center space-x-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {walletAddress ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-secondary text-background-color px-4 py-2 rounded-lg font-bold transition"
          onClick={disconnectWallet}
        >
          Atsijungti ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-secondary text-background-color px-4 py-2 rounded-lg font-bold transition flex items-center"
          onClick={connectWallet}
        >
          <FaWallet className="mr-2" /> Prisijungti
        </motion.button>
      )}
    </motion.div>
  );
}
