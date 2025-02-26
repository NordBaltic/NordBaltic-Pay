// 📂 /frontend/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="copyright">© {new Date().getFullYear()} NordBaltic Pay. All rights reserved.</p>
        <nav className="footer-nav">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="social-links">
          <a href="https://twitter.com/NordBalticPay" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://linkedin.com/company/NordBalticPay" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
