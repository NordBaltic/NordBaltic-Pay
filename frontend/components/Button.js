// 📂 /frontend/components/Button.js - Globalus prabangus mygtukas
import '../styles.css';

export default function Button({ text, onClick }) {
  return (
    <button className="custom-button" onClick={onClick}>
      {text}
    </button>
  );
}
