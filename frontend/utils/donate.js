// 📂 /frontend/utils/donate.js - Automatinė labdaros sistema
import Web3 from 'web3';

let web3;
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
} else {
  console.log('MetaMask not detected');
}

const charities = {
  "Global Aid Fund": "0x1234567890abcdef1234567890abcdef12345678",
  "Children's Future": "0xabcdef1234567890abcdef1234567890abcdef12",
  "Green Earth Initiative": "0x7890abcdef1234567890abcdef1234567890abcd"
};

export const donateToCharity = async (charityName, amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const charityWallet = charities[charityName];
    if (!charityWallet) throw new Error("Invalid charity selected");

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: charityWallet,
      value: web3.utils.toWei(amount, 'ether')
    });
    console.log(`Donated ${amount} BNB to ${charityName}`);
  } catch (error) {
    console.error('Donation failed:', error);
  }
};
