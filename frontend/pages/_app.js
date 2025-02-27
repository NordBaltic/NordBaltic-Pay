import "../styles/globals.css"; // ✅ Turi būti frontend/styles/globals.css

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
