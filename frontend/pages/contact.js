// 📂 /frontend/pages/contact.js - Kontaktų puslapis
import '../styles.css';

export default function Contact() {
  return (
    <div className="container">
      <h1 className="title">Contact Us</h1>
      <p className="content">For any inquiries or support, feel free to contact us:</p>
      <ul className="content">
        <li>Email: support@nordbalticpay.com</li>
        <li>Phone: +370 627 4544</li>
        <li>Address: Vilnius, Lithuania</li>
      </ul>
      <p className="content">We aim to respond within 24 hours. Thank you for using NordBaltic Pay!</p>
    </div>
  );
}
