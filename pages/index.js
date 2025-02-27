import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 Automatinis dashboard duomenų gavimas
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`);
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("❌ Klaida gaunant dashboard duomenis:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <>
      {/* ✅ SEO ir Favicon optimizacija */}
      <Head>
        <title>NordBaltic Pay Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NordBaltic Pay - Web3 Financial Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ✅ Pagrindinis UI su mobiliuoju pritaikymu */}
      <div className={styles.container}>
        <header className={styles.header}>
          <Image src="/logo.png" alt="NordBaltic Pay" width={120} height={40} />
          <h1>Dashboard</h1>
        </header>

        {/* ✅ Rodo įkrovimo indikatorių kol gaunami duomenys */}
        {loading ? (
          <p className={styles.loading}>🔄 Kraunama...</p>
        ) : (
          <main className={styles.main}>
            {dashboardData ? (
              <>
                <section className={styles.card}>
                  <h2>Balansas</h2>
                  <p>{dashboardData.balance} EUR</p>
                </section>
                <section className={styles.card}>
                  <h2>Transakcijos</h2>
                  <p>{dashboardData.transactions} vykdomos</p>
                </section>
              </>
            ) : (
              <p className={styles.error}>⚠️ Nepavyko gauti duomenų</p>
            )}
          </main>
        )}
      </div>
    </>
  );
}
