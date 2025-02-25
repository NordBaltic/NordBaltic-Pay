// 📂 /frontend/components/Navbar.js - Navigacijos meniu komponentas
import Link from 'next/link';
import '../styles.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">NordBaltic Pay</h1>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/staking" className="nav-link">Staking</Link>
          <Link href="/admin" className="nav-link">Admin</Link>
          <Link href="/donate" className="nav-link">Donate</Link>
        </div>
      </div>
    </nav>
  );
}
