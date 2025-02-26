import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Admin from "../components/Admin";
import "../styles/globals.css";

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAccount");
    if (storedAccount) {
      setAccount(storedAccount);
      checkAdminStatus(storedAccount);
    } else {
      router.push("/");
    }
  }, []);

  const checkAdminStatus = async (wallet) => {
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
    if (wallet.toLowerCase() === adminWallet.toLowerCase()) {
      setIsAdmin(true);
    } else {
      alert("🚫 Access Denied: You are not an admin!");
      router.push("/");
    }
  };

  return (
    <div className="admin-page">
      <h1>🔧 Admin Dashboard</h1>
      {isAdmin ? <Admin /> : <p>⏳ Verifying admin access...</p>}
    </div>
  );
      }
