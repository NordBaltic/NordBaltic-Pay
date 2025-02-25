// 📂 /frontend/utils/web3.js - MetaMask integracija ir sąveika su BSC tinklu
import Web3 from 'web3';

let web3;
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
} else {
  console.log('MetaMask not detected');
}

export const connectWallet = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return null;
  }
};

export const getWalletBalance = async (walletAddress) => {
  try {
    const balance = await web3.eth.getBalance(walletAddress);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
};

export const sendTransaction = async (recipient, amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: recipient,
      value: web3.utils.toWei(amount, 'ether')
    });
    console.log('Transaction successful!');
  } catch (error) {
    console.error('Transaction failed:', error);
  }
};
