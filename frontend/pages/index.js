import styles from "../styles/Home.module.css";

import { useEffect, useState } from "react";
import Head from "next/head";
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
      {/* ✅ SEO optimizacija ir favicon */}
      <Head>
        <title>NordBaltic Pay Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NordBaltic Pay - Web3 Financial Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ✅ Pagrindinis UI su mobiliuoju pritaikymu */}
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to NordBaltic Pay</h1>

        {/* ✅ Įkrovimo indikatorius */}
        {loading ? (
          <p className={styles.loading}>🔄 Kraunama...</p>
        ) : dashboardData ? (
          <div className={styles.dashboard}>
            <section className={styles.card}>
              <h2>Balansas</h2>
              <p>{dashboardData.balance} EUR</p>
            </section>
            <section className={styles.card}>
              <h2>Transakcijos</h2>
              <p>{dashboardData.transactions} vykdomos</p>
            </section>
          </div>
        ) : (
          <p className={styles.error}>⚠️ Nepavyko gauti duomenų</p>
        )}
      </div>
    </>
  );
}
