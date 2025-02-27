import '../styles/globals.css'; // Importuoja globalų CSS
import '../styles/theme.css'; // Importuoja theme CSS

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
