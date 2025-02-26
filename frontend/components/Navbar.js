import Link from 'next/link';
import styles from '../styles/theme.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">
          <img src="/logo.png" alt="NordBaltic Pay" className="logo-img" />
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/staking">Staking</Link></li>
        <li><Link href="/donations">Donations</Link></li>
        <li><Link href="/receive">Receive</Link></li>
        <li><Link href="/send">Send</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </nav>
  );
}
