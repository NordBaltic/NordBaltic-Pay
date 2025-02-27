import Head from "next/head";
import "../styles/globals.css";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* ✅ Geresnis SEO ir favicon palaikymas */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NordBaltic Pay - Web3 Financial Ecosystem" />
        <meta name="keywords" content="Web3, Crypto, Finance, NordBaltic Pay" />
        <meta name="author" content="NordBaltic Pay" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        {/* ✅ Struktūra su pagrindiniu konteineriu */}
        <div id="layout">
          {/* ✅ Čia gali būti navbar, footer ar kiti globalūs komponentai */}
          {children}
        </div>
      </body>
    </html>
  );
}
