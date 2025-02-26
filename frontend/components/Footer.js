// 📂 /frontend/components/Footer.js - Puslapio apatinė dalis (footer)
import Link from "next/link";
import { FaFacebook, FaTwitter, FaTelegram, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>NordBaltic Pay</h2>
          <p>Built on Binance Smart Chain</p>
        </div>

        <div className="footer-links">
          <Link href="/dashboard"><a>Dashboard</a></Link>
          <Link href="/staking"><a>Staking</a></Link>
          <Link href="/transactions"><a>Transactions</a></Link>
          <Link href="/donations"><a>Donations</a></Link>
          <Link href="/admin"><a>Admin</a></Link>
          <Link href="/privacy"><a>Privacy</a></Link>
          <Link href="/terms"><a>Terms</a></Link>
          <Link href="/contact"><a>Contact</a></Link>
        </div>

        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer"><FaTelegram /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NordBaltic Pay. All rights reserved.</p>
      </div>
    </footer>
  );
}
