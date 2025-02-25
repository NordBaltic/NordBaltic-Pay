// 📂 /frontend/utils/staking.js - Pilna staking sistema su automatiniais reward'ais
import Web3 from 'web3';

let web3;
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
} else {
  console.log('MetaMask not detected');
}

const stakingContractAddress = "0xMarinadeStakingContract"; // Tikras adresas turi būti čia
const adminWallet = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113";
const stakingFee = 5; // 5% fee
const unstakeFee = 5; // 5% fee

export const stakeBNB = async (amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: stakingContractAddress,
      value: web3.utils.toWei(amount, 'ether')
    });
    console.log('Staked successfully!');
  } catch (error) {
    console.error('Staking failed:', error);
  }
};

export const unstakeBNB = async (amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const feeAmount = (amount * unstakeFee) / 100;
    const netAmount = amount - feeAmount;

    await web3.eth.sendTransaction({
      from: stakingContractAddress,
      to: accounts[0],
      value: web3.utils.toWei(netAmount.toString(), 'ether')
    });
    await web3.eth.sendTransaction({
      from: stakingContractAddress,
      to: adminWallet,
      value: web3.utils.toWei(feeAmount.toString(), 'ether')
    });
    console.log('Unstaked successfully with fee!');
  } catch (error) {
    console.error('Unstaking failed:', error);
  }
};

export const claimRewards = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    const rewards = await web3.eth.getBalance(stakingContractAddress); // Example calculation

    await web3.eth.sendTransaction({
      from: stakingContractAddress,
      to: accounts[0],
      value: rewards
    });
    console.log('Rewards claimed successfully!');
  } catch (error) {
    console.error('Claiming rewards failed:', error);
  }
};

export const getStakingBalance = async (walletAddress) => {
  try {
    const balance = await web3.eth.getBalance(stakingContractAddress);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error('Error fetching staking balance:', error);
    return '0';
  }
};
