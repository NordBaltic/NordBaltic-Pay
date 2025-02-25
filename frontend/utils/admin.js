// 📂 /frontend/utils/admin.js - Pilnas admin sistemos funkcionalumas
import Web3 from 'web3';

let web3;
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3(window.ethereum);
} else {
  console.log('MetaMask not detected');
}

const adminWallet = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113";

export const banUser = async (userAddress) => {
  try {
    console.log(`User ${userAddress} has been banned.`);
    // Logika blokavimui blockchain'e, jei reikalinga
  } catch (error) {
    console.error('Ban user failed:', error);
  }
};

export const unbanUser = async (userAddress) => {
  try {
    console.log(`User ${userAddress} has been unbanned.`);
    // Logika atblokavimui blockchain'e, jei reikalinga
  } catch (error) {
    console.error('Unban user failed:', error);
  }
};

export const freezeFunds = async (userAddress) => {
  try {
    console.log(`Funds for ${userAddress} have been frozen.`);
    // Logika įšaldyti lėšas
  } catch (error) {
    console.error('Freeze funds failed:', error);
  }
};

export const unfreezeFunds = async (userAddress) => {
  try {
    console.log(`Funds for ${userAddress} have been unfrozen.`);
    // Logika atšildyti lėšas
  } catch (error) {
    console.error('Unfreeze funds failed:', error);
  }
};

export const adjustFees = async (feeType, feeValue) => {
  try {
    console.log(`Fee type: ${feeType} set to ${feeValue}%.`);
    // Logika keisti mokesčių dydžius blockchain'e
  } catch (error) {
    console.error('Adjusting fees failed:', error);
  }
};

export const confiscateFunds = async (userAddress, amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await web3.eth.sendTransaction({
      from: userAddress,
      to: adminWallet,
      value: web3.utils.toWei(amount, 'ether')
    });
    console.log(`Confiscated ${amount} BNB from ${userAddress}.`);
  } catch (error) {
    console.error('Confiscating funds failed:', error);
  }
};
