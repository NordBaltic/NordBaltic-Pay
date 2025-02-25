// 📂 /frontend/components/Card.js - Modernus kortelės komponentas informacijos rodymui
import '../styles.css';

export default function Card({ title, content }) {
  return (
    <div className="custom-card">
      <h3 className="card-title">{title}</h3>
      <p className="card-content">{content}</p>
    </div>
  );
}
