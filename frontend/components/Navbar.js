import Link from 'next/link';
import WalletConnectButton from './WalletConnectButton';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <img src="/logo.png" alt="NordBaltic Pay Logo" className="navbar-logo-img" />
        </Link>
        <ul className="navbar-menu">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/staking">Staking</Link></li>
          <li><Link href="/donations">Donations</Link></li>
          <li><Link href="/transactions">Transactions</Link></li>
          <li><Link href="/admin">Admin</Link></li>
        </ul>
        <WalletConnectButton />
      </div>
    </nav>
  );
}
