import { useEffect, useState } from "react";
import Admin from "../components/Admin";
import Analytics from "../components/Analytics";
import Security from "../components/Security";
import { useRouter } from "next/router";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
    const storedAccount = localStorage.getItem("walletAccount");

    if (storedAccount && storedAccount.toLowerCase() === adminWallet.toLowerCase()) {
      setIsAuthenticated(true);
    } else {
      router.push("/"); // ✅ Jei ne admin, peradresuojame į pagrindinį puslapį
    }
  }, []);

  return (
    <div className="admin-page">
      {isAuthenticated ? (
        <>
          <h1>🔧 Admin Panel</h1>
          <Admin />
          <Analytics />
          <Security /> {/* ✅ Pridėta saugumo sistema */}
        </>
      ) : (
        <p className="error-text">⏳ Loading...</p>
      )}
    </div>
  );
}
