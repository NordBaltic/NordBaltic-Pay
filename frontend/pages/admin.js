import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Admin from "../components/Admin";

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;

  useEffect(() => {
    const checkAccount = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          if (accounts[0].toLowerCase() === adminWallet.toLowerCase()) {
            setIsAuthorized(true);
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("User denied account access", error);
        }
      }
    };

    checkAccount();
  }, [router]);

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
      });

      await provider.enable();
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      if (accounts[0].toLowerCase() === adminWallet.toLowerCase()) {
        setIsAuthorized(true);
      } else {
        alert("❌ Access denied! Only Admin can enter.");
        router.push("/");
      }
    } catch (error) {
      console.error("WalletConnect error:", error);
    }
  };

  return (
    <div className="admin-page">
      <h1>👑 Admin Panel</h1>
      {!account ? (
        <div className="wallet-buttons">
          <button className="wallet-connect-btn" onClick={connectWalletConnect}>
            🔗 Connect WalletConnect
          </button>
          <button className="wallet-connect-btn" onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}>
            🦊 Connect MetaMask
          </button>
        </div>
      ) : isAuthorized ? (
        <Admin adminAccount={account} />
      ) : (
        <p className="error-text">❌ Access Denied! Only Admin can enter this panel.</p>
      )}
    </div>
  );
}
