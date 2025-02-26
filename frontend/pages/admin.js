// 📂 /pages/admin.js - Admin Valdymas
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const WALLET_CONTRACT_ADDRESS = "0xYOUR_WALLET_CONTRACT_ADDRESS";

export default function Admin() {
  const [swapFee, setSwapFee] = useState(20);
  const [transferFee, setTransferFee] = useState(300);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          setAccount(await signer.getAddress());
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      }
    };

    loadAccount();
  }, []);

  const updateSwapFee = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(WALLET_CONTRACT_ADDRESS, [
        "function setSwapFee(uint256 _newFee) external"
      ], signer);

      const tx = await contract.setSwapFee(swapFee
