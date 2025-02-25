// 📂 /frontend/pages/_app.js - Globalus aplankų valdymas ir navigacija
import '../styles.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
