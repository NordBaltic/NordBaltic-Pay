import Web3 from "web3";
import { contractABI, contractAddress } from "../utils/config.js";

const web3 = new Web3(process.env.NEXT_PUBLIC_BSC_RPC_URL);
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 🔥 FETCH CONTRACT STATS
export const getContractStats = async (req, res) => {
  try {
    const totalStaked = await contract.methods.totalStaked().call();
    const swapFeesCollected = await contract.methods.swapFeesCollected().call();
    const txCount = await contract.methods.transactionCount().call();

    res.json({
      totalStaked: web3.utils.fromWei(totalStaked, "ether"),
      swapFeesCollected: web3.utils.fromWei(swapFeesCollected, "ether"),
      totalTransactions: txCount,
    });
  } catch (error) {
    console.error("❌ Error fetching contract stats:", error);
    res.status(500).json({ error: "Failed to fetch contract stats." });
  }
};

// 🔥 UPDATE CONTRACT PARAMETERS
export const updateContractParams = async (req, res) => {
  try {
    const { param, value } = req.body;
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;

    const tx = await contract.methods.updateSetting(param, value).send({
      from: adminWallet,
      gas: 200000,
    });

    res.json({ success: true, txHash: tx.transactionHash });
  } catch (error) {
    console.error("❌ Error updating contract params:", error);
    res.status(500).json({ error: "Failed to update contract settings." });
  }
};

// 🔥 EXECUTE ADMIN ACTIONS
export const executeAdminAction = async (req, res) => {
  try {
    const { action } = req.body;
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;

    const tx = await contract.methods[action]().send({
      from: adminWallet,
      gas: 200000,
    });

    res.json({ success: true, txHash: tx.transactionHash });
  } catch (error) {
    console.error("❌ Error executing admin action:", error);
    res.status(500).json({ error: "Failed to execute action." });
  }
};
