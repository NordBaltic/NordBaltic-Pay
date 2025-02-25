// 📂 /frontend/pages/terms.js - Paslaugų teikimo taisyklių puslapis
import '../styles.css';

export default function Terms() {
  return (
    <div className="container">
      <h1 className="title">Terms of Service</h1>
      <p className="content">By using NordBaltic Pay, you agree to the following terms and conditions:</p>
      <ul className="content">
        <li>All transactions are final and cannot be reversed.</li>
        <li>Users are responsible for securing their own wallet keys.</li>
        <li>NordBaltic Pay does not provide financial advice.</li>
        <li>We reserve the right to update our terms at any time.</li>
      </ul>
      <p className="content">For any legal inquiries, please contact our support team.</p>
    </div>
  );
}
