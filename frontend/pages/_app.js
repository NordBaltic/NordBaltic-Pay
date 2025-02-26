// 📂 /frontend/pages/_app.js
// ✅ Pagrindinis Next.js failas, užtikrinantis visų puslapių vientisumą
// ✅ Čia importuojami globalūs CSS ir tema
// ✅ Navbar + Footer užtikrina vienodą išdėstymą

import '../styles/globals.css';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    }
  }, []);

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}

export default MyApp;
