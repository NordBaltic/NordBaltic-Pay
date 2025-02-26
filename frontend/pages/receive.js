import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Receive from "../components/Receive"; // ✅ Importuojame Receive komponentą
import Loader from "../components/Loader"; // ✅ Krovimosi efektas
import "../styles/globals.css";

export default function ReceivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const storedAccount = localStorage.getItem("walletAccount");
      if (!storedAccount) {
        router.push("/"); // 🔄 Nukreipia į pagrindinį puslapį, jei nėra prisijungęs
      } else {
        setAccount(storedAccount);
      }
      setIsLoading(false);
    };
    checkLogin();
  }, [router]);

  return (
    <div className="receive-page-container">
      {isLoading ? (
        <Loader message="Loading receive page..." />
      ) : (
        <>
          <h1 className="page-title">📥 Receive Crypto</h1>
          <Receive /> {/* ✅ Čia įkeliame atnaujintą Receive komponentą */}
        </>
      )}
    </div>
  );
}
