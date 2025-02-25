// 📂 /frontend/pages/privacy.js - Privatumo politikos puslapis
import '../styles.css';

export default function Privacy() {
  return (
    <div className="container">
      <h1 className="title">Privacy Policy</h1>
      <p className="content">At NordBaltic Pay, we take your privacy seriously. We do not store private wallet keys, and all transactions are handled securely via blockchain technology.</p>
      <p className="content">By using our platform, you agree to the collection of anonymized usage data to improve our services. We do not share any personal information with third parties.</p>
      <p className="content">For more details, please contact our support team.</p>
    </div>
  );
}
