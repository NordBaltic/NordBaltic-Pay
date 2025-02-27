import '../styles/globals.css';
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    console.log("✅ `globals.css` įkeltas. Body background spalva:", bodyBg);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
