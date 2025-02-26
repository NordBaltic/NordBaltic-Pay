import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Send from "../components/Send"; // ✅ Importuojame Send komponentą
import Loader from "../components/Loader"; // ✅ Krovimosi efektas
import "../styles/globals.css";

export default function SendPage() {
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
    <div className="send-page-container">
      {isLoading ? (
        <Loader message="Loading send page..." />
      ) : (
        <>
          <h1 className="page-title">🚀 Send Crypto</h1>
          <Send /> {/* ✅ Čia įkeliame atnaujintą Send komponentą */}
        </>
      )}
    </div>
  );
}
