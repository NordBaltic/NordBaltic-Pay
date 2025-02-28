import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/buttons.css';
import '../styles/navbar.css';
import '../styles/tables.css';
import '../styles/cards.css';
import '../styles/inputs.css';
import '../styles/loading.css';
import '../styles/login.css';  // ✅ PRIDĖTAS LOGIN UI
import { playUISound } from '../utils/sounds';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
