import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/buttons.css';
import '../styles/navbar.css';
import '../styles/tables.css';
import '../styles/cards.css';
import '../styles/inputs.css';  // ✅ TEISINGAS IMPORTAS
import '../styles/loading.css';
import { playUISound } from '../utils/sounds';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
