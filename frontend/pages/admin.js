import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

const ADMIN_WALLET = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113"; // Admin piniginė
const STAKING_CONTRACT = "your-staking-contract-address";
const USER_LIST = [
  { address: "0xUser1WalletAddress", status: "active", balance: "2.5 BNB", staked: "1.2 BNB" },
  { address: "0xUser2WalletAddress", status: "banned", balance: "0.8 BNB", staked: "0.3 BNB" },
  { address: "0xUser3WalletAddress", status: "active", balance: "5.0 BNB", staked: "3.7 BNB" }
];

export default function AdminPanel() {
  const [users, setUsers] = useState(USER_LIST);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Čia būtų galima prijungti realią DB (Supabase)
    console.log("Atnaujinta naudotojų informacija.");
  };

  const handleBanUnban = (userAddress) => {
    setUsers(users.map(user => user.address === userAddress ? { ...user, status: user.status === "active" ? "banned" : "active" } : user));
  };

  const handleFreezeUnfreeze = (userAddress) => {
    setUsers(users.map(user => user.address === userAddress ? { ...user, status: user.status === "frozen" ? "active" : "frozen" } : user));
  };

  const handleWithdrawFunds = async (userAddress, amount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      alert(`Sėkmingai nurašyta ${amount} BNB iš ${userAddress}`);
    } catch (error) {
      console.error("Klaida išimant lėšas:", error);
      alert("Klaida, bandykite dar kartą.");
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
        <h1 className="text-4xl font-bold text-secondary">Admin Panel</h1>
        <p className="text-lg opacity-80 mt-2">Manage users, transactions, and staking pools.</p>
      </div>

      <div className="max-w-5xl mx-auto bg-primary p-6 rounded-lg shadow-dark">
        <h2 className="text-xl font-bold text-secondary mb-4">User Management</h2>

        <table className="w-full bg-secondary text-background-color rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="p-3">Wallet Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Staked</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="border-b text-center">
                <td className="p-3 break-all">{user.address}</td>
                <td className={`p-3 ${user.status === "banned" ? "text-red-500" : user.status === "frozen" ? "text-yellow-500" : "text-green-500"}`}>
                  {user.status}
                </td>
                <td className="p-3">{user.balance}</td>
                <td className="p-3">{user.staked}</td>
                <td className="p-3 flex justify-center space-x-2">
                  <button onClick={() => handleBanUnban(user.address)} className="p-2 bg-red-500 text-white rounded-lg">
                    {user.status === "banned" ? "Unban" : "Ban"}
                  </button>
                  <button onClick={() => handleFreezeUnfreeze(user.address)} className="p-2 bg-yellow-500 text-white rounded-lg">
                    {user.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </button>
                  <button onClick={() => handleWithdrawFunds(user.address, "0.5")} className="p-2 bg-blue-500 text-white rounded-lg">
                    Deduct 0.5 BNB
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
