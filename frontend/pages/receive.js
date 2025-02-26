import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import '../styles/globals.css';

export default function Receive() {
  const [walletAddress, setWalletAddress] = useState('');
  const [adminFee, setAdminFee] = useState(0.02); // 2% admin fee
  const adminWallet = "0xC7ACc7c830aa381b6A7E7cF8bAA9ddea6E576113";

  useEffect(() => {
    // Paimame prisijungusio vartotojo adresą
    async function getWalletAddress() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      }
    }
    getWalletAddress();
  }, []);

  const generateQRData = () => {
    const transactionAmount = 1; // Pvz., 1 BNB (galima padaryti įvedamą lauką vėliau)
    const adminCut = transactionAmount * adminFee;
    const userReceives = transactionAmount - adminCut;

    return JSON.stringify({
      to: walletAddress,
      amount: userReceives,
      admin_fee: adminCut,
      admin_wallet: adminWallet
    });
  };

  return (
    <div className="receive-container">
      <h2>Receive Funds</h2>
      <p>Scan the QR code below to receive funds directly into your wallet.</p>
      
      {walletAddress ? (
        <>
          <QRCode value={generateQRData()} size={150} />
          <p className="receive-address" onClick={() => navigator.clipboard.writeText(walletAddress)}>
            {walletAddress}
          </p>
          <p className="small-text">Click to copy your address</p>
        </>
      ) : (
        <p>Loading wallet address...</p>
      )}
    </div>
  );
}
