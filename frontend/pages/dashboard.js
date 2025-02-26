import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "../components/ThemeContext";
import "../styles/globals.css";

// Dinaminis Dashboard komponento importas (SSR išjungtas)
const DashboardComponent = dynamic(() => import("../components/Dashboard"), { ssr: false });

export default function DashboardPage() {
  const [account, setAccount] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAccount");
    if (!storedAccount) {
      router.push("/"); // Jei nėra prisijungimo, grąžina į pagrindinį puslapį
    } else {
      setAccount(storedAccount);
    }
  }, [router]);

  return (
    <div className={`dashboard-page ${theme}`}>
      <DashboardComponent />
    </div>
  );
}
