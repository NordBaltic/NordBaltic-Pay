import "../styles/globals.css";
import { useEffect } from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useRouter } from "next/router";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      {/* ✅ Pataisytas <Head> komponentas */}
      <Head>
        <title>NordBaltic Pay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta name="description" content="NordBaltic Pay - Web3 Financial Ecosystem" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ✅ Apvyniojimas ThemeSwitcher */}
      <ThemeSwitcher />

      {/* ✅ Apvyniojimas globaliu konteineriu */}
      <main className="app-container">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
