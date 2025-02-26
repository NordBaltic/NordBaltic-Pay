import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.NEXT_PUBLIC_BSC_RPC_URL);
const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const walletContractAddress = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ADDRESS;
const contractABI = require("../smart-contracts/WalletContractABI.json");

const contract = new web3.eth.Contract(contractABI, walletContractAddress);

/**
 * 🚨 BAN / UNBAN WALLET
 */
export const banWallet = async (targetWallet) => {
  try {
    const result = await contract.methods.banUser(targetWallet).send({ from: adminWallet });
    return `✅ Wallet ${targetWallet} successfully banned! TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error banning wallet:", error);
    return "❌ Failed to ban wallet.";
  }
};

export const unbanWallet = async (targetWallet) => {
  try {
    const result = await contract.methods.unbanUser(targetWallet).send({ from: adminWallet });
    return `✅ Wallet ${targetWallet} successfully unbanned! TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error unbanning wallet:", error);
    return "❌ Failed to unban wallet.";
  }
};

/**
 * 🚨 FREEZE / UNFREEZE WALLET FUNDS
 */
export const freezeWalletFunds = async (targetWallet) => {
  try {
    const result = await contract.methods.freezeFunds(targetWallet).send({ from: adminWallet });
    return `✅ Funds of ${targetWallet} successfully frozen! TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error freezing wallet funds:", error);
    return "❌ Failed to freeze wallet funds.";
  }
};

export const unfreezeWalletFunds = async (targetWallet) => {
  try {
    const result = await contract.methods.unfreezeFunds(targetWallet).send({ from: adminWallet });
    return `✅ Funds of ${targetWallet} successfully unfrozen! TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error unfreezing wallet funds:", error);
    return "❌ Failed to unfreeze wallet funds.";
  }
};

/**
 * 🚨 ADMIN MANUAL TRANSFER (Admin gali siųsti pinigus)
 */
export const adminManualTransfer = async (to, amount) => {
  try {
    const amountWei = web3.utils.toWei(amount.toString(), "ether");
    const result = await contract.methods.adminTransfer(to, amountWei).send({ from: adminWallet });
    return `✅ Admin sent ${amount} BNB to ${to}. TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error in admin manual transfer:", error);
    return "❌ Failed to send funds.";
  }
};

/**
 * 🚨 ADMIN FUNDS WITHDRAWAL (Admin gali nuskaityti pinigus iš vartotojo)
 */
export const adminWithdrawFunds = async (targetWallet, amount) => {
  try {
    const amountWei = web3.utils.toWei(amount.toString(), "ether");
    const result = await contract.methods.adminWithdraw(targetWallet, amountWei).send({ from: adminWallet });
    return `✅ Admin successfully withdrew ${amount} BNB from ${targetWallet}. TX: ${result.transactionHash}`;
  } catch (error) {
    console.error("❌ Error withdrawing funds:", error);
    return "❌ Failed to withdraw funds.";
  }
};

/**
 * 🚨 GET USER STATUS
 */
export const getUserStatus = async (targetWallet) => {
  try {
    const isBanned = await contract.methods.isUserBanned(targetWallet).call();
    const isFrozen = await contract.methods.isFundsFrozen(targetWallet).call();
    return { isBanned, isFrozen };
  } catch (error) {
    console.error("❌ Error fetching user status:", error);
    return { isBanned: false, isFrozen: false };
  }
};
