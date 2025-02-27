import "../styles/globals.css";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // 🚀 Automatinis scroll to top keičiant puslapį
  useEffect(() => {
    const handleRouteChange = () => window.scrollTo(0, 0);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      {/* ✅ SEO ir favicon palaikymas */}
      <Head>
        <title>NordBaltic Pay</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NordBaltic Pay - Web3 Financial Ecosystem" />
        <meta name="keywords" content="Web3, Crypto, Finance, NordBaltic Pay" />
        <meta name="author" content="NordBaltic Pay" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ✅ Globalus Layout, jei reikia */}
      <div id="app-container">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
