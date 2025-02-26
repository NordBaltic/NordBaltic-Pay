import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default function WalletConnectButton() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
        }
      }
    }
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // Naudojame Infura API
            },
          },
        },
      });

      const instance = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(instance);
      setProvider(newProvider);

      const accounts = await newProvider.listAccounts();
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="bg-gold text-darkblue px-4 py-2 rounded-lg font-bold hover:bg-white transition"
    >
      {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
