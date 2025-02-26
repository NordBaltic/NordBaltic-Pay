export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} NordBaltic Pay. All Rights Reserved.</p>
        <ul className="footer-links">
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms & Conditions</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="https://github.com/NordBaltic/NordBaltic-Pay" target="_blank">GitHub</a></li>
        </ul>
      </div>
    </footer>
  );
}
