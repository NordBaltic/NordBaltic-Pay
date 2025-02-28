import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/navbar.css';
import '../styles/buttons.css';
import '../styles/tables.css';
import '../styles/cards.css';
import '../styles/inputs.css';
import '../styles/loading.css';
import '../styles/login.css';
import '../styles/forms.css';      // ✅ Formų dizainas
import '../styles/animations.css'; // ✅ Animacijos

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
