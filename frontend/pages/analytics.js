import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Web3 from "web3";
import "../styles/globals.css";

const AnalyticsComponent = dynamic(() => import("../components/Analytics"), { ssr: false });

export default function AnalyticsPage() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET.toLowerCase();
          if (accounts[0].toLowerCase() === adminWallet) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push("/");
          }
        } catch (error) {
          console.error("🔴 MetaMask connection error:", error);
          router.push("/");
        }
      }
    };

    checkAdminAccess();
  }, [router]);

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AnalyticsComponent />
    </div>
  );
}
