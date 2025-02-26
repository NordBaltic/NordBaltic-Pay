import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const STAKING_CONTRACT = "your-staking-contract-address"; // Pakeisti į tikrą Marinade staking kontraktą

export default function Staking() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [stakingBalance, setStakingBalance] = useState("0.00");
  const [rewardBalance, setRewardBalance] = useState("0.00");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    if (savedWallet) {
      setWalletAddress(savedWallet);
      fetchStakingInfo(savedWallet);
    }
  }, []);

  const fetchStakingInfo = async (wallet) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const contract = new ethers.Contract(
        STAKING_CONTRACT,
        ["function balanceOf(address owner) view returns (uint256)", "function earned(address account) view returns (uint256)"],
        provider
      );

      const staked = await contract.balanceOf(wallet);
      const earned = await contract.earned(wallet);

      setStakingBalance(ethers.utils.formatEther(staked));
      setRewardBalance(ethers.utils.formatEther(earned));
    } catch (error) {
      console.error("Klaida gaunant staking informaciją:", error);
    }
  };

  const handleStake = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        STAKING_CONTRACT,
        ["function stake(uint256 amount)"],
        signer
      );

      const tx = await contract.stake(ethers.utils.parseEther(amount));
      await tx.wait();
      alert("Sėkmingai stake'inote!");
      fetchStakingInfo(walletAddress);
    } catch (error) {
      console.error("Staking klaida:", error);
    }
  };

  const handleUnstake = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        STAKING_CONTRACT,
        ["function withdraw(uint256 amount)"],
        signer
      );

      const tx = await contract.withdraw(ethers.utils.parseEther(stakingBalance));
      await tx.wait();
      alert("Sėkmingai unstake'inote!");
      fetchStakingInfo(walletAddress);
    } catch (error) {
      console.error("Unstaking klaida:", error);
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
        <h1 className="text-4xl font-bold text-secondary">Staking</h1>
        <p className="text-lg opacity-80 mt-2">Earn passive income by staking your BSC assets.</p>
      </div>

      {walletAddress ? (
        <div className="max-w-3xl mx-auto bg-primary p-6 rounded-lg shadow-dark">
          <h2 className="text-xl font-bold text-secondary">Your Staking Balance: {stakingBalance} NBT</h2>
          <h3 className="text-lg mt-2 text-white">Earned Rewards: {rewardBalance} BNB</h3>

          <div className="mt-4">
            <input
              type="number"
              className="w-full p-3 rounded bg-secondary text-background-color"
              placeholder="Enter amount to stake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleStake} className="w-full mt-3 p-3 bg-secondary text-background-color rounded-lg">
              Stake
            </button>
            <button onClick={handleUnstake} className="w-full mt-3 p-3 bg-red-500 text-white rounded-lg">
              Unstake
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-white">Please connect your wallet to access staking.</p>
      )}
    </motion.div>
  );
}
