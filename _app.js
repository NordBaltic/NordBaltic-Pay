import "../styles/globals.css";
import ThemeSwitcher from "../components/ThemeSwitcher";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ThemeSwitcher />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
