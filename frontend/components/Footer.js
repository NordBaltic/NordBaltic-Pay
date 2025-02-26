import Link from 'next/link';
import '../styles/globals.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">© 2025 NordBaltic Pay. All rights reserved.</p>
        <ul className="footer-links">
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms of Service</Link></li>
          <li><Link href="/contact">Contact Us</Link></li>
        </ul>
      </div>
    </footer>
  );
}
